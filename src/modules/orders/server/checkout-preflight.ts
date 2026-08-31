import "server-only";

import {
  validateGuestCart,
  type GuestCartValidationIssue,
  type ValidatedGuestCartItem,
} from "@/modules/orders/server/cart-validation";

export type GuestCheckoutPreflightResult =
  | Readonly<{
      status: "READY";
      items: readonly ValidatedGuestCartItem[];
    }>
  | Readonly<{
      status: "CONFLICT";
      issues: readonly GuestCartValidationIssue[];
    }>;

/**
 * Establishes the server-owned cart state required by order creation.
 *
 * A price mismatch remains a conflict until the client explicitly submits the current price from
 * the conflict response as its newly observed price. Callers must never create an order from the
 * original local cart or from a partial validation result.
 */
export async function preflightGuestCheckout(
  input: unknown,
): Promise<GuestCheckoutPreflightResult> {
  const result = await validateGuestCart(input);

  if (result.issues.length > 0) {
    return { status: "CONFLICT", issues: result.issues };
  }

  return { status: "READY", items: result.items };
}
