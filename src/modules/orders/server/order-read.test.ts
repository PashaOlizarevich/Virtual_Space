import { beforeEach, describe, expect, it, jest } from "@jest/globals";
jest.mock("@/server/db", () => ({ db: {} }));

const decimal = (value: string) => ({ toFixed: () => value });

const orderRecord = {
  publicNumber: "VS-TESTORDER001",
  status: "NEW" as const,
  currency: "BYN" as const,
  total: decimal("2780.00"),
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-01T10:01:00.000Z"),
  items: [
    {
      id: BigInt(7),
      snapshotName: "Кресло",
      snapshotOptions: [{ groupId: "fabric", optionId: "linen" }],
      snapshotPrice: decimal("2780.00"),
      quantity: 1,
      lineTotal: decimal("2780.00"),
    },
  ],
};

describe("order read contracts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retrieves a signed-in user's order by server-owned user id", async () => {
    const findFirst = jest.fn(async () => orderRecord);
    const { getCustomerOrder } = await import("@/modules/orders/server/order-read");

    const result = await getCustomerOrder({ orderNumber: "vs-testorder001" }, "user-1", {
      order: { findFirst },
    } as never);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          publicNumber: "VS-TESTORDER001",
          OR: [{ userId: "user-1" }],
        },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        orderNumber: "VS-TESTORDER001",
        total: { amount: "2780.00", currency: "BYN" },
      }),
    );
    expect(result).not.toHaveProperty("customer");
  });

  it("requires both the public number and normalized email for a guest order", async () => {
    const findFirst = jest.fn(async () => orderRecord);
    const { getCustomerOrder } = await import("@/modules/orders/server/order-read");

    await getCustomerOrder({ orderNumber: "VS-TESTORDER001", email: " GUEST@Example.com " }, null, {
      order: { findFirst },
    } as never);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          publicNumber: "VS-TESTORDER001",
          OR: [{ userId: null, email: { equals: "guest@example.com", mode: "insensitive" } }],
        },
      }),
    );
  });

  it("does not query when an unauthenticated caller omits guest ownership proof", async () => {
    const findFirst = jest.fn(async () => orderRecord);
    const { getCustomerOrder, OrderNotFoundError } =
      await import("@/modules/orders/server/order-read");

    await expect(
      getCustomerOrder({ orderNumber: "VS-TESTORDER001" }, null, { order: { findFirst } } as never),
    ).rejects.toBeInstanceOf(OrderNotFoundError);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("returns a bounded admin page and exposes no internal order id", async () => {
    const findMany = jest.fn(async () => [
      {
        ...orderRecord,
        customerName: "Анна",
        email: "a@example.com",
        phone: "+375291234567",
        comment: null,
      },
      {
        ...orderRecord,
        publicNumber: "VS-SECOND",
        customerName: "Борис",
        email: "b@example.com",
        phone: "+375291234568",
        comment: "Позвонить",
      },
    ]);
    const { listAdminOrders } = await import("@/modules/orders/server/order-read");

    const result = await listAdminOrders({ limit: 1 }, { order: { findMany } } as never);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2 }));
    expect(result.orders).toHaveLength(1);
    expect(result.nextCursor).toBe("VS-TESTORDER001");
    expect(result.orders[0]).not.toHaveProperty("id");
    expect(result.orders[0]?.customer).toEqual({
      name: "Анна",
      email: "a@example.com",
      phone: "+375291234567",
      comment: null,
    });
  });
});
