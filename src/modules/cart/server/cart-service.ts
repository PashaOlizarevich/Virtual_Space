import "server-only";

import type { Currency, Prisma, PrismaClient } from "@prisma/client";

import {
  cartItemIdentitySchema,
  cartQuantityUpdateSchema,
  selectedCartOptionsSchema,
  type CartItemIdentityInput,
} from "@/modules/cart/server/schemas";
import { db } from "@/server/db";
import { requireUser } from "@/server/user-auth";
import { mapMoney, type MoneyDto } from "@/shared/money";

const cartItemSelect = {
  productId: true,
  selectedOptions: true,
  optionsKey: true,
  quantity: true,
  observedPrice: true,
  product: {
    select: {
      name: true,
      slug: true,
      price: true,
      currency: true,
      stock: true,
      isActive: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { secureUrl: true, alt: true },
      },
      optionGroups: {
        orderBy: { position: "asc" },
        select: {
          key: true,
          label: true,
          options: { orderBy: { position: "asc" }, select: { key: true, label: true } },
        },
      },
    },
  },
} satisfies Prisma.CartItemSelect;

type CartItemRecord = Prisma.CartItemGetPayload<{ select: typeof cartItemSelect }>;
type CartDatabase = Pick<PrismaClient, "cart" | "cartItem" | "product">;

export type ServerCartItemStatus =
  | "AVAILABLE"
  | "PRICE_CHANGED"
  | "PRODUCT_UNAVAILABLE"
  | "INVALID_CONFIGURATION"
  | "INSUFFICIENT_STOCK";

export type ServerCartItemDto = Readonly<{
  productId: string;
  name: string;
  slug: string;
  image: string;
  imageAlt: string;
  quantity: number;
  selectedOptions: readonly Readonly<{
    groupId: string;
    groupLabel: string;
    optionId: string;
    optionLabel: string;
  }>[];
  observedPrice: MoneyDto;
  currentPrice: MoneyDto;
  status: ServerCartItemStatus;
}>;

export type ServerCartDto = Readonly<{ items: readonly ServerCartItemDto[] }>;

export class CartInputError extends Error {}
export class CartItemNotFoundError extends Error {}
export class CartItemConflictError extends Error {
  constructor(readonly code: Exclude<ServerCartItemStatus, "AVAILABLE" | "PRICE_CHANGED">) {
    super(code);
  }
}

export function createOptionsKey(input: CartItemIdentityInput): string {
  return input.selectedOptions
    .map(({ groupId, optionId }) => `${groupId.length}:${groupId}${optionId.length}:${optionId}`)
    .sort()
    .join("|");
}

function mapOptions(record: CartItemRecord) {
  const parsed = selectedCartOptionsSchema.safeParse(record.selectedOptions);
  if (!parsed.success) return { valid: false, options: [] } as const;

  let valid = parsed.data.length === record.product.optionGroups.length;
  const result = [];
  for (const selected of parsed.data) {
    const group = record.product.optionGroups.find(({ key }) => key === selected.groupId);
    const option = group?.options.find(({ key }) => key === selected.optionId);
    if (!group || !option) valid = false;
    result.push({
      groupId: selected.groupId,
      groupLabel: group?.label ?? selected.groupId,
      optionId: selected.optionId,
      optionLabel: option?.label ?? selected.optionId,
    });
  }
  return { valid, options: result } as const;
}

function money(value: CartItemRecord["observedPrice"], currency: Currency): MoneyDto {
  return mapMoney(value, currency);
}

function toDto(record: CartItemRecord, totalQuantity: number): ServerCartItemDto {
  const selectedOptions = mapOptions(record);
  let status: ServerCartItemStatus = "AVAILABLE";

  if (!record.product.isActive) status = "PRODUCT_UNAVAILABLE";
  else if (!selectedOptions.valid) status = "INVALID_CONFIGURATION";
  else if (totalQuantity > record.product.stock) status = "INSUFFICIENT_STOCK";
  else if (!record.observedPrice.equals(record.product.price)) status = "PRICE_CHANGED";

  return {
    productId: record.productId.toString(),
    name: record.product.name,
    slug: record.product.slug ?? "",
    image: record.product.images?.[0]?.secureUrl ?? "",
    imageAlt: record.product.images?.[0]?.alt ?? "",
    quantity: record.quantity,
    selectedOptions: selectedOptions.options,
    observedPrice: money(record.observedPrice, record.product.currency),
    currentPrice: money(record.product.price, record.product.currency),
    status,
  };
}

async function readCartItems(userId: string, database: CartDatabase): Promise<CartItemRecord[]> {
  const cart = await database.cart.findUnique({
    where: { userId },
    select: {
      items: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: cartItemSelect },
    },
  });
  return cart?.items ?? [];
}

export async function buildServerCart(
  userId: string,
  database: CartDatabase,
): Promise<ServerCartDto> {
  const records = await readCartItems(userId, database);
  const totals = new Map<string, number>();
  for (const record of records) {
    const key = record.productId.toString();
    totals.set(key, (totals.get(key) ?? 0) + record.quantity);
  }
  return {
    items: records.map((record) => toDto(record, totals.get(record.productId.toString()) ?? 0)),
  };
}

export async function getServerCart(database: CartDatabase = db): Promise<ServerCartDto> {
  const principal = await requireUser();
  return buildServerCart(principal.id, database);
}

export async function updateServerCartItemQuantity(
  input: unknown,
  database: CartDatabase = db,
): Promise<ServerCartDto> {
  const parsed = cartQuantityUpdateSchema.safeParse(input);
  if (!parsed.success) throw new CartInputError("Invalid cart input");
  const principal = await requireUser();
  const productId = BigInt(parsed.data.productId);
  const optionsKey = createOptionsKey(parsed.data);

  const product = await database.product.findUnique({
    where: { id: productId },
    select: {
      price: true,
      stock: true,
      isActive: true,
      optionGroups: { select: { key: true, options: { select: { key: true } } } },
    },
  });
  if (!product?.isActive) throw new CartItemConflictError("PRODUCT_UNAVAILABLE");
  if (parsed.data.quantity > product.stock) throw new CartItemConflictError("INSUFFICIENT_STOCK");
  if (
    parsed.data.selectedOptions.length !== product.optionGroups.length ||
    parsed.data.selectedOptions.some(({ groupId, optionId }) => {
      const group = product.optionGroups.find(({ key }) => key === groupId);
      return !group?.options.some(({ key }) => key === optionId);
    })
  ) {
    throw new CartItemConflictError("INVALID_CONFIGURATION");
  }

  const productItems = await database.cartItem.findMany({
    where: { productId, cart: { userId: principal.id } },
    select: { optionsKey: true, quantity: true },
  });
  const otherQuantity = productItems.reduce(
    (total, item) => total + (item.optionsKey === optionsKey ? 0 : item.quantity),
    0,
  );
  if (otherQuantity + parsed.data.quantity > product.stock) {
    throw new CartItemConflictError("INSUFFICIENT_STOCK");
  }

  const updated = await database.cartItem.updateMany({
    where: { productId, optionsKey, cart: { userId: principal.id } },
    data: { quantity: parsed.data.quantity, observedPrice: product.price },
  });
  if (updated.count !== 1) throw new CartItemNotFoundError("Cart item not found");
  return buildServerCart(principal.id, database);
}

export async function removeServerCartItem(
  input: unknown,
  database: CartDatabase = db,
): Promise<ServerCartDto> {
  const parsed = cartItemIdentitySchema.safeParse(input);
  if (!parsed.success) throw new CartInputError("Invalid cart input");
  const principal = await requireUser();
  const removed = await database.cartItem.deleteMany({
    where: {
      productId: BigInt(parsed.data.productId),
      optionsKey: createOptionsKey(parsed.data),
      cart: { userId: principal.id },
    },
  });
  if (removed.count !== 1) throw new CartItemNotFoundError("Cart item not found");
  return buildServerCart(principal.id, database);
}
