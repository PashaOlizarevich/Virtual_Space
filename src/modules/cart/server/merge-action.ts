"use server";

import {
  CartMergeConflictError,
  CartMergeInputError,
  mergeGuestCart,
  type CartMergeIssue,
} from "@/modules/cart/server/cart-merge";
import type { ServerCartDto } from "@/modules/cart/server/cart-service";
import { UserAuthenticationRequiredError } from "@/server/user-auth";

export type MergeGuestCartActionResult =
  | Readonly<{ ok: true; cart: ServerCartDto }>
  | Readonly<{ ok: false; code: "UNAUTHENTICATED" | "INVALID_INPUT" | "INTERNAL_ERROR" }>
  | Readonly<{ ok: false; code: "CART_CONFLICT"; issues: readonly CartMergeIssue[] }>;

export async function mergeGuestCartAction(input: unknown): Promise<MergeGuestCartActionResult> {
  try {
    return { ok: true, cart: await mergeGuestCart(input) };
  } catch (error) {
    if (error instanceof UserAuthenticationRequiredError) {
      return { ok: false, code: "UNAUTHENTICATED" };
    }
    if (error instanceof CartMergeInputError) return { ok: false, code: "INVALID_INPUT" };
    if (error instanceof CartMergeConflictError) {
      return { ok: false, code: "CART_CONFLICT", issues: error.issues };
    }
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}
