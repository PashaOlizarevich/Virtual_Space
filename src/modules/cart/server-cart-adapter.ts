import type { ServerCartDto } from "@/modules/cart/server/cart-service";
import type { CartItem } from "@/modules/cart/types";
import { moneyToNumber } from "@/shared/money";

export function cartItemKey(item: Pick<CartItem, "productId" | "selectedOptions">) {
  return `${item.productId}|${item.selectedOptions
    .map(({ groupId, optionId }) => `${groupId}:${optionId}`)
    .toSorted()
    .join("|")}`;
}

export function mapServerCartToLocal(cart: ServerCartDto): readonly CartItem[] {
  return cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions.map(({ groupId, optionId }) => ({ groupId, optionId })),
    observedPrice: moneyToNumber(item.currentPrice),
    productSnapshot: {
      slug: item.slug,
      name: item.name,
      description: "",
      image: item.image,
      imageAlt: item.imageAlt,
      optionGroups: item.selectedOptions.map(({ groupId, groupLabel, optionId, optionLabel }) => ({
        id: groupId,
        label: groupLabel,
        options: [{ id: optionId, label: optionLabel }],
      })),
    },
  }));
}
