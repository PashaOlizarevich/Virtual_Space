import "server-only";

import type { Currency } from "@prisma/client";

import { findCartProducts, type CartProductRecord } from "@/modules/orders/server/queries";
import {
  guestCartValidationSchema,
  type GuestCartValidationInput,
} from "@/modules/orders/server/schemas";
import { mapMoney, type MoneyDto } from "@/shared/money";

type SelectedOptionSnapshot = Readonly<{
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
}>;

export type ValidatedGuestCartItem = Readonly<{
  productId: string;
  name: string;
  quantity: number;
  selectedOptions: readonly SelectedOptionSnapshot[];
  unitPrice: MoneyDto;
}>;

export type GuestCartValidationIssue = Readonly<{
  productId: string;
  code: "PRODUCT_UNAVAILABLE" | "INSUFFICIENT_STOCK" | "INVALID_CONFIGURATION" | "PRICE_CHANGED";
  currentPrice?: MoneyDto;
}>;

export type GuestCartValidationResult = Readonly<{
  items: readonly ValidatedGuestCartItem[];
  issues: readonly GuestCartValidationIssue[];
}>;

type ProductLoader = (productIds: readonly bigint[]) => Promise<CartProductRecord[]>;

function mapSelectedOptions(
  selectedOptions: GuestCartValidationInput["items"][number]["selectedOptions"],
  product: CartProductRecord,
): readonly SelectedOptionSnapshot[] | null {
  if (selectedOptions.length !== product.optionGroups.length) return null;

  const snapshots: SelectedOptionSnapshot[] = [];

  for (const selected of selectedOptions) {
    const group = product.optionGroups.find(({ key }) => key === selected.groupId);
    const option = group?.options.find(({ key }) => key === selected.optionId);

    if (!group || !option) return null;

    snapshots.push({
      groupId: group.key,
      groupLabel: group.label,
      optionId: option.key,
      optionLabel: option.label,
    });
  }

  return snapshots;
}

function hasSamePrice(observedPrice: number, currentPrice: CartProductRecord["price"]): boolean {
  return observedPrice.toFixed(2) === currentPrice.toFixed(2);
}

function currencyToMoney(price: CartProductRecord["price"], currency: Currency): MoneyDto {
  return mapMoney(price, currency);
}

export async function validateGuestCart(
  input: unknown,
  loadProducts: ProductLoader = findCartProducts,
): Promise<GuestCartValidationResult> {
  const { items } = guestCartValidationSchema.parse(input);
  const productIds = [...new Set(items.map(({ productId }) => productId))].map(BigInt);
  const products = await loadProducts(productIds);
  const productsById = new Map(products.map((product) => [product.id.toString(), product]));
  const quantitiesByProduct = new Map<string, number>();

  for (const item of items) {
    quantitiesByProduct.set(
      item.productId,
      (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const validatedItems: ValidatedGuestCartItem[] = [];
  const issues: GuestCartValidationIssue[] = [];

  for (const item of items) {
    const product = productsById.get(item.productId);

    if (!product?.isActive) {
      issues.push({ productId: item.productId, code: "PRODUCT_UNAVAILABLE" });
      continue;
    }

    if ((quantitiesByProduct.get(item.productId) ?? 0) > product.stock) {
      issues.push({ productId: item.productId, code: "INSUFFICIENT_STOCK" });
      continue;
    }

    const selectedOptions = mapSelectedOptions(item.selectedOptions, product);

    if (!selectedOptions) {
      issues.push({ productId: item.productId, code: "INVALID_CONFIGURATION" });
      continue;
    }

    const currentPrice = currencyToMoney(product.price, product.currency);

    if (!hasSamePrice(item.observedPrice, product.price)) {
      issues.push({ productId: item.productId, code: "PRICE_CHANGED", currentPrice });
      continue;
    }

    validatedItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      selectedOptions,
      unitPrice: currentPrice,
    });
  }

  return { items: validatedItems, issues };
}
