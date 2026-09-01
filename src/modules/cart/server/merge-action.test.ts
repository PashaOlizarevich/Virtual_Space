import { describe, expect, it, jest } from "@jest/globals";

const mergeGuestCart = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/modules/cart/server/cart-merge", () => {
  class CartMergeInputError extends Error {}
  class CartMergeConflictError extends Error {
    constructor(readonly issues: readonly unknown[]) {
      super("conflict");
    }
  }
  return { mergeGuestCart, CartMergeInputError, CartMergeConflictError };
});

jest.mock("@/server/user-auth", () => {
  class UserAuthenticationRequiredError extends Error {}
  return { UserAuthenticationRequiredError };
});

describe("merge guest cart action", () => {
  it("returns the merged server cart", async () => {
    mergeGuestCart.mockResolvedValue({ items: [] });
    const { mergeGuestCartAction } = await import("@/modules/cart/server/merge-action");
    await expect(mergeGuestCartAction({ items: [] })).resolves.toEqual({
      ok: true,
      cart: { items: [] },
    });
  });

  it("maps validation and merge conflicts without internal details", async () => {
    const { CartMergeConflictError, CartMergeInputError } =
      await import("@/modules/cart/server/cart-merge");
    const { mergeGuestCartAction } = await import("@/modules/cart/server/merge-action");
    mergeGuestCart.mockRejectedValueOnce(new CartMergeInputError());
    mergeGuestCart.mockRejectedValueOnce(
      new CartMergeConflictError([
        { productId: "7", selectedOptions: [], code: "INSUFFICIENT_STOCK" },
      ]),
    );

    await expect(mergeGuestCartAction({})).resolves.toEqual({
      ok: false,
      code: "INVALID_INPUT",
    });
    await expect(mergeGuestCartAction({})).resolves.toEqual({
      ok: false,
      code: "CART_CONFLICT",
      issues: [{ productId: "7", selectedOptions: [], code: "INSUFFICIENT_STOCK" }],
    });
  });

  it("maps a missing authenticated user", async () => {
    const { UserAuthenticationRequiredError } = await import("@/server/user-auth");
    const { mergeGuestCartAction } = await import("@/modules/cart/server/merge-action");
    mergeGuestCart.mockRejectedValueOnce(new UserAuthenticationRequiredError());

    await expect(mergeGuestCartAction({ items: [] })).resolves.toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
    });
  });
});
