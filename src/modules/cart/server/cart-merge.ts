import "server-only";

import type { Prisma } from "@prisma/client";

import {
  buildServerCart,
  createOptionsKey,
  type ServerCartDto,
} from "@/modules/cart/server/cart-service";
import { guestCartMergeSchema, type CartQuantityUpdateInput } from "@/modules/cart/server/schemas";
import { db } from "@/server/db";
import { requireUser } from "@/server/user-auth";

const MAX_SERIALIZABLE_RETRIES = 3;

type CartMergeTransaction = Pick<Prisma.TransactionClient, "cart" | "cartItem" | "product">;
export type CartMergeTransactionRunner = <Result>(
  operation: (transaction: CartMergeTransaction) => Promise<Result>,
) => Promise<Result>;

export type CartMergeIssueCode =
  "PRODUCT_UNAVAILABLE" | "INVALID_CONFIGURATION" | "INSUFFICIENT_STOCK" | "QUANTITY_LIMIT";

export type CartMergeIssue = Readonly<{
  productId: string;
  selectedOptions: CartQuantityUpdateInput["selectedOptions"];
  code: CartMergeIssueCode;
}>;

export class CartMergeInputError extends Error {}
export class CartMergeConflictError extends Error {
  constructor(readonly issues: readonly CartMergeIssue[]) {
    super("Guest cart cannot be merged into the server cart");
    this.name = "CartMergeConflictError";
  }
}

function defaultTransactionRunner<Result>(
  operation: (transaction: CartMergeTransaction) => Promise<Result>,
): Promise<Result> {
  return db.$transaction(operation, {
    isolationLevel: "Serializable",
  });
}

function isRetryableTransactionError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return error.code === "P2002" || error.code === "P2034";
}

function normalizeOptions(
  options: CartQuantityUpdateInput["selectedOptions"],
): CartQuantityUpdateInput["selectedOptions"] {
  return [...options].sort(
    (left, right) =>
      left.groupId.localeCompare(right.groupId) || left.optionId.localeCompare(right.optionId),
  );
}

export async function mergeGuestCart(
  input: unknown,
  executeTransaction: CartMergeTransactionRunner = defaultTransactionRunner,
): Promise<ServerCartDto> {
  const parsed = guestCartMergeSchema.safeParse(input);
  if (!parsed.success) throw new CartMergeInputError("Invalid guest cart input");
  const principal = await requireUser();

  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_RETRIES; attempt += 1) {
    try {
      return await executeTransaction(async (transaction) => {
        const guestByIdentity = new Map<
          string,
          CartQuantityUpdateInput & Readonly<{ optionsKey: string }>
        >();
        const issues: CartMergeIssue[] = [];

        for (const item of parsed.data.items) {
          const selectedOptions = normalizeOptions(item.selectedOptions);
          const optionsKey = createOptionsKey({ ...item, selectedOptions });
          const identity = `${item.productId}:${optionsKey}`;
          const existing = guestByIdentity.get(identity);
          const quantity = (existing?.quantity ?? 0) + item.quantity;
          const normalized = { ...item, selectedOptions, optionsKey, quantity };
          guestByIdentity.set(identity, normalized);
          if (quantity > 99) {
            issues.push({ productId: item.productId, selectedOptions, code: "QUANTITY_LIMIT" });
          }
        }

        const guestItems = [...guestByIdentity.values()];
        const productIds = [...new Set(guestItems.map(({ productId }) => productId))];
        const products = await transaction.product.findMany({
          where: { id: { in: productIds.map(BigInt) } },
          select: {
            id: true,
            price: true,
            stock: true,
            isActive: true,
            optionGroups: { select: { key: true, options: { select: { key: true } } } },
          },
        });
        const productsById = new Map(products.map((product) => [product.id.toString(), product]));
        const existingItems = await transaction.cartItem.findMany({
          where: { cart: { userId: principal.id } },
          select: { productId: true, optionsKey: true, quantity: true },
        });
        const existingByIdentity = new Map(
          existingItems.map((item) => [
            `${item.productId.toString()}:${item.optionsKey}`,
            item.quantity,
          ]),
        );
        const quantitiesByProduct = new Map<string, number>();

        for (const item of existingItems) {
          const productId = item.productId.toString();
          quantitiesByProduct.set(
            productId,
            (quantitiesByProduct.get(productId) ?? 0) + item.quantity,
          );
        }
        for (const item of guestItems) {
          quantitiesByProduct.set(
            item.productId,
            (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity,
          );
          const identity = `${item.productId}:${item.optionsKey}`;
          if ((existingByIdentity.get(identity) ?? 0) + item.quantity > 99) {
            issues.push({ ...item, code: "QUANTITY_LIMIT" });
          }
          const product = productsById.get(item.productId);
          if (!product?.isActive) {
            issues.push({ ...item, code: "PRODUCT_UNAVAILABLE" });
            continue;
          }
          const validConfiguration =
            item.selectedOptions.length === product.optionGroups.length &&
            item.selectedOptions.every(({ groupId, optionId }) => {
              const group = product.optionGroups.find(({ key }) => key === groupId);
              return group?.options.some(({ key }) => key === optionId);
            });
          if (!validConfiguration) issues.push({ ...item, code: "INVALID_CONFIGURATION" });
        }
        for (const item of guestItems) {
          const product = productsById.get(item.productId);
          if (product?.isActive && (quantitiesByProduct.get(item.productId) ?? 0) > product.stock) {
            issues.push({ ...item, code: "INSUFFICIENT_STOCK" });
          }
        }
        if (issues.length > 0) {
          throw new CartMergeConflictError(
            issues.map(({ productId, selectedOptions, code }) => ({
              productId,
              selectedOptions,
              code,
            })),
          );
        }

        if (guestItems.length > 0) {
          const cart = await transaction.cart.upsert({
            where: { userId: principal.id },
            create: { userId: principal.id },
            update: {},
            select: { id: true },
          });
          for (const item of guestItems) {
            const product = productsById.get(item.productId)!;
            const identity = `${item.productId}:${item.optionsKey}`;
            const quantity = (existingByIdentity.get(identity) ?? 0) + item.quantity;
            await transaction.cartItem.upsert({
              where: {
                cartId_productId_optionsKey: {
                  cartId: cart.id,
                  productId: BigInt(item.productId),
                  optionsKey: item.optionsKey,
                },
              },
              create: {
                cartId: cart.id,
                productId: BigInt(item.productId),
                selectedOptions: item.selectedOptions,
                optionsKey: item.optionsKey,
                quantity,
                observedPrice: product.price,
              },
              update: {
                selectedOptions: item.selectedOptions,
                quantity,
                observedPrice: product.price,
              },
            });
          }
        }

        return buildServerCart(principal.id, transaction);
      });
    } catch (error) {
      if (isRetryableTransactionError(error) && attempt < MAX_SERIALIZABLE_RETRIES) continue;
      throw error;
    }
  }

  throw new Error("Unable to merge guest cart");
}
