import { persistedCartSchema } from "@/modules/cart/schemas";
import type { CartItem } from "@/modules/cart/types";

function itemKey(item: CartItem) {
  const options = item.selectedOptions
    .map(({ groupId, optionId }) => `${groupId}:${optionId}`)
    .toSorted()
    .join("|");
  return `${item.productId}|${options}`;
}

export function mergeCarts(
  serverItems: readonly CartItem[],
  guestItems: readonly CartItem[],
): readonly CartItem[] {
  const parsedServer = persistedCartSchema.safeParse({ items: serverItems });
  const parsedGuest = persistedCartSchema.safeParse({ items: guestItems });
  if (!parsedServer.success || !parsedGuest.success) {
    throw new Error("Корзина содержит некорректные данные.");
  }

  const merged = new Map<string, CartItem>();
  for (const item of [...parsedServer.data.items, ...parsedGuest.data.items]) {
    const key = itemKey(item);
    const current = merged.get(key);
    merged.set(
      key,
      current ? { ...item, quantity: Math.min(99, current.quantity + item.quantity) } : item,
    );
  }
  return [...merged.values()].slice(0, 100);
}
