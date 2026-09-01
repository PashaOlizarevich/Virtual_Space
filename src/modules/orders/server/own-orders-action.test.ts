import { describe, expect, it, jest } from "@jest/globals";

const listOwnOrders = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/modules/orders/server/order-read", () => ({ listOwnOrders }));
jest.mock("@/server/user-auth", () => {
  class UserAuthenticationRequiredError extends Error {}
  return { UserAuthenticationRequiredError };
});

describe("own orders action", () => {
  it("returns only the safe page produced by the ownership-scoped service", async () => {
    listOwnOrders.mockResolvedValue({ orders: [], nextCursor: null });
    const { listOwnOrdersAction } = await import("@/modules/orders/server/own-orders-action");

    await expect(listOwnOrdersAction({ limit: 20 })).resolves.toEqual({
      ok: true,
      page: { orders: [], nextCursor: null },
    });
  });

  it("maps authentication failures without exposing internal details", async () => {
    const { UserAuthenticationRequiredError } = await import("@/server/user-auth");
    listOwnOrders.mockRejectedValue(new UserAuthenticationRequiredError("private details"));
    const { listOwnOrdersAction } = await import("@/modules/orders/server/own-orders-action");

    await expect(listOwnOrdersAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
    });
  });
});
