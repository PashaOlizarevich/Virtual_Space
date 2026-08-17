import type { CartItem } from "@/modules/cart/types";
import { products } from "@/modules/catalog/mock-data";
import type { Product } from "@/modules/catalog/types";

export type ValidatedCartItem =
  | Readonly<{ status: "available"; item: CartItem; product: Product; currentPrice: number }>
  | Readonly<{ status: "price-changed"; item: CartItem; product: Product; currentPrice: number }>
  | Readonly<{ status: "unavailable"; item: CartItem; product?: Product }>;

function hasCurrentOptions(item: CartItem, product: Product) {
  return item.selectedOptions.every(({ groupId, optionId }) => {
    const group = product.optionGroups.find(({ id }) => id === groupId);
    return group?.options.some(({ id }) => id === optionId) ?? false;
  });
}

export function validateCartItem(item: CartItem): ValidatedCartItem {
  const product = products.find(({ id }) => id === item.productId);

  if (!product || !hasCurrentOptions(item, product)) {
    return { status: "unavailable", item, product };
  }

  return {
    status: item.observedPrice === product.price ? "available" : "price-changed",
    item,
    product,
    currentPrice: product.price,
  };
}
