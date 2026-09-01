import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const requireAdmin = jest.fn<() => Promise<{ id: string; email: string; role: "ADMIN" }>>();
const updateOrderStatus = jest.fn<(input: unknown, adminId: string) => Promise<unknown>>();

jest.mock("@/server/admin-auth", () => ({
  withAdminAuthorization:
    (operation: (admin: { id: string }, input: unknown) => Promise<unknown>) =>
    async (input: unknown) =>
      operation(await requireAdmin(), input),
}));
jest.mock("@/modules/orders/server/order-read", () => ({ listAdminOrders: jest.fn() }));
jest.mock("@/modules/orders/server/order-status-update", () => ({ updateOrderStatus }));

describe("protected administrative order status mutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rechecks the current administrator before forwarding the mutation", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "ADMIN" });
    updateOrderStatus.mockResolvedValue({ orderNumber: "VS-ORDER42", status: "CONFIRMED" });
    const { updateAdminOrderStatus } = await import("@/modules/orders/server/admin-status");
    const input = { orderNumber: "VS-ORDER42", status: "CONFIRMED" as const };

    await updateAdminOrderStatus(input);

    expect(requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      updateOrderStatus.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(updateOrderStatus).toHaveBeenCalledWith(input, "admin-1");
  });

  it("does not begin the mutation if the role check fails", async () => {
    requireAdmin.mockRejectedValue(new Error("forbidden"));
    const { updateAdminOrderStatus } = await import("@/modules/orders/server/admin-status");

    await expect(
      updateAdminOrderStatus({ orderNumber: "VS-ORDER42", status: "CONFIRMED" }),
    ).rejects.toThrow("forbidden");
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });
});
