import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const requireAdmin = jest.fn<() => Promise<{ id: string; email: string; role: "ADMIN" }>>();
const listAdminOrders = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/server/admin-auth", () => ({
  withAdminAuthorization:
    (operation: (admin: unknown, input: unknown) => Promise<unknown>) => async (input: unknown) =>
      operation(await requireAdmin(), input),
}));
jest.mock("@/modules/orders/server/order-read", () => ({ listAdminOrders }));

describe("protected admin order reads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("checks the current administrator before querying orders", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "ADMIN" });
    listAdminOrders.mockResolvedValue({ orders: [], nextCursor: null });
    const { getAdminOrders } = await import("@/modules/orders/server/admin");

    await expect(getAdminOrders({ limit: 25 })).resolves.toEqual({ orders: [], nextCursor: null });
    expect(requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      listAdminOrders.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it("does not query orders when authorization fails", async () => {
    requireAdmin.mockRejectedValue(new Error("forbidden"));
    const { getAdminOrders } = await import("@/modules/orders/server/admin");

    await expect(getAdminOrders({})).rejects.toThrow("forbidden");
    expect(listAdminOrders).not.toHaveBeenCalled();
  });
});
