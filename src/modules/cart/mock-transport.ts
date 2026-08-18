import { persistedCartSchema } from "@/modules/cart/schemas";
import { mergeCarts } from "@/modules/cart/sync";
import type { CartItem } from "@/modules/cart/types";

export const PREVIEW_SERVER_CART_KEY = "virtual-space:preview-server-cart:v1";

function readServerCart(): readonly CartItem[] {
  try {
    const raw = window.localStorage.getItem(PREVIEW_SERVER_CART_KEY);
    if (!raw) return [];
    const parsedJson: unknown = JSON.parse(raw);
    const parsed = persistedCartSchema.safeParse(parsedJson);
    return parsed.success ? parsed.data.items : [];
  } catch {
    return [];
  }
}

export async function synchronizeCartPreview(
  guestItems: readonly CartItem[],
): Promise<readonly CartItem[]> {
  const merged = mergeCarts(readServerCart(), guestItems);
  await saveServerCartPreview(merged);
  return merged;
}

export async function saveServerCartPreview(items: readonly CartItem[]): Promise<void> {
  const parsed = persistedCartSchema.safeParse({ items });
  if (!parsed.success) throw new Error("Не удалось синхронизировать корзину.");
  if (!navigator.onLine) throw new Error("Нет подключения к интернету.");
  try {
    window.localStorage.setItem(PREVIEW_SERVER_CART_KEY, JSON.stringify(parsed.data));
  } catch {
    throw new Error("Не удалось сохранить корзину пользователя.");
  }
}
