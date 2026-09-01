"use server";

import {
  CartInputError,
  CartItemConflictError,
  CartItemNotFoundError,
  getServerCart,
  removeServerCartItem,
  type ServerCartDto,
  updateServerCartItemQuantity,
} from "@/modules/cart/server/cart-service";
import { UserAuthenticationRequiredError } from "@/server/user-auth";

export type ServerCartActionResult =
  | Readonly<{ ok: true; cart: ServerCartDto }>
  | Readonly<{
      ok: false;
      code:
        | "UNAUTHENTICATED"
        | "INVALID_INPUT"
        | "ITEM_NOT_FOUND"
        | "PRODUCT_UNAVAILABLE"
        | "INVALID_CONFIGURATION"
        | "INSUFFICIENT_STOCK"
        | "INTERNAL_ERROR";
    }>;

function mapError(error: unknown): ServerCartActionResult {
  if (error instanceof UserAuthenticationRequiredError)
    return { ok: false, code: "UNAUTHENTICATED" };
  if (error instanceof CartInputError) return { ok: false, code: "INVALID_INPUT" };
  if (error instanceof CartItemNotFoundError) return { ok: false, code: "ITEM_NOT_FOUND" };
  if (error instanceof CartItemConflictError) return { ok: false, code: error.code };
  return { ok: false, code: "INTERNAL_ERROR" };
}

export async function getServerCartAction(): Promise<ServerCartActionResult> {
  try {
    return { ok: true, cart: await getServerCart() };
  } catch (error) {
    return mapError(error);
  }
}

export async function updateServerCartItemQuantityAction(
  input: unknown,
): Promise<ServerCartActionResult> {
  try {
    return { ok: true, cart: await updateServerCartItemQuantity(input) };
  } catch (error) {
    return mapError(error);
  }
}

export async function removeServerCartItemAction(input: unknown): Promise<ServerCartActionResult> {
  try {
    return { ok: true, cart: await removeServerCartItem(input) };
  } catch (error) {
    return mapError(error);
  }
}
