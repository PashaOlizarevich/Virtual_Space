import { describe, expect, it, jest } from "@jest/globals";

const getServerCart = jest.fn<() => Promise<unknown>>();
const updateServerCartItemQuantity = jest.fn<(input: unknown) => Promise<unknown>>();
const removeServerCartItem = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/modules/cart/server/cart-service", () => {
  class CartInputError extends Error {}
  class CartItemNotFoundError extends Error {}
  class CartItemConflictError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  }
  return {
    getServerCart,
    updateServerCartItemQuantity,
    removeServerCartItem,
    CartInputError,
    CartItemNotFoundError,
    CartItemConflictError,
  };
});

jest.mock("@/server/user-auth", () => {
  class UserAuthenticationRequiredError extends Error {}
  return { UserAuthenticationRequiredError };
});

describe("server cart actions", () => {
  it("returns the revalidated cart", async () => {
    getServerCart.mockResolvedValue({ items: [] });
    const { getServerCartAction } = await import("@/modules/cart/server/actions");
    await expect(getServerCartAction()).resolves.toEqual({ ok: true, cart: { items: [] } });
  });

  it("maps authentication and domain conflicts without internal details", async () => {
    const { UserAuthenticationRequiredError } = await import("@/server/user-auth");
    const { CartItemConflictError } = await import("@/modules/cart/server/cart-service");
    const { getServerCartAction, updateServerCartItemQuantityAction } =
      await import("@/modules/cart/server/actions");
    getServerCart.mockRejectedValueOnce(new UserAuthenticationRequiredError());
    updateServerCartItemQuantity.mockRejectedValueOnce(
      new CartItemConflictError("INSUFFICIENT_STOCK" as never),
    );

    await expect(getServerCartAction()).resolves.toEqual({ ok: false, code: "UNAUTHENTICATED" });
    await expect(updateServerCartItemQuantityAction({})).resolves.toEqual({
      ok: false,
      code: "INSUFFICIENT_STOCK",
    });
  });
});
