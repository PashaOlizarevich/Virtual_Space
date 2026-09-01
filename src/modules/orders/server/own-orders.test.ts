import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/server/user-auth", () => ({ requireUser: jest.fn() }));

const decimal = (value: string) => ({ toFixed: () => value });

const orderRecord = {
  publicNumber: "VS-OWNED001",
  status: "NEW" as const,
  currency: "BYN" as const,
  total: decimal("120.00"),
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-01T10:01:00.000Z"),
  items: [
    {
      id: BigInt(7),
      snapshotName: "Стол",
      snapshotOptions: [],
      snapshotPrice: decimal("120.00"),
      quantity: 1,
      lineTotal: decimal("120.00"),
    },
  ],
};

describe("own order history", () => {
  it("scopes the bounded query to the authenticated owner", async () => {
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue({ id: "user-1" } as never);
    const findMany = jest.fn(async () => [
      orderRecord,
      { ...orderRecord, publicNumber: "VS-OWNED002" },
    ]);
    const { listOwnOrders } = await import("@/modules/orders/server/order-read");

    const result = await listOwnOrders({ cursor: "VS-CURSOR001", limit: 1 }, {
      order: { findMany },
    } as never);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        cursor: { publicNumber: "VS-CURSOR001", userId: "user-1" },
        skip: 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 2,
      }),
    );
    expect(result.nextCursor).toBe("VS-OWNED001");
    expect(result.orders[0]).not.toHaveProperty("customer");
    expect(result.orders[0]).not.toHaveProperty("id");
  });

  it("rejects unknown fields before authentication and database access", async () => {
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockClear();
    const findMany = jest.fn();
    const { listOwnOrders } = await import("@/modules/orders/server/order-read");

    await expect(
      listOwnOrders({ limit: 20, userId: "victim" } as never, { order: { findMany } } as never),
    ).rejects.toBeDefined();
    expect(requireUser).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });
});
