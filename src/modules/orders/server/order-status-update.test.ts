import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { OrderStatusTransactionRunner } from "@/modules/orders/server/order-status-update";

let updateOrderStatus: (typeof import("@/modules/orders/server/order-status-update"))["updateOrderStatus"];
let ConcurrentOrderStatusUpdateError: (typeof import("@/modules/orders/server/order-status-update"))["ConcurrentOrderStatusUpdateError"];
let OrderStatusUpdateNotFoundError: (typeof import("@/modules/orders/server/order-status-update"))["OrderStatusUpdateNotFoundError"];

beforeAll(async () => {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  ({ updateOrderStatus, ConcurrentOrderStatusUpdateError, OrderStatusUpdateNotFoundError } =
    await import("@/modules/orders/server/order-status-update"));
});

describe("administrative order status update", () => {
  const findUnique =
    jest.fn<
      () => Promise<{ id: bigint; publicNumber: string; status: "NEW" | "COMPLETED" } | null>
    >();
  const updateMany = jest.fn<() => Promise<{ count: number }>>();
  const createHistory = jest.fn<() => Promise<{ id: bigint }>>();
  const transaction = {
    order: { findUnique, updateMany },
    orderStatusHistory: { create: createHistory },
  };
  const runTransaction: OrderStatusTransactionRunner = async (operation) =>
    operation(transaction as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unknown input fields before opening a transaction", async () => {
    let transactionCalls = 0;
    const transactionRunner: OrderStatusTransactionRunner = async () => {
      transactionCalls += 1;
      throw new Error("Transaction must not start");
    };

    await expect(
      updateOrderStatus(
        { orderNumber: "VS-ORDER42", status: "CONFIRMED", role: "ADMIN" } as never,
        "admin-1",
        transactionRunner,
      ),
    ).rejects.toBeDefined();
    expect(transactionCalls).toBe(0);
  });

  it("updates the guarded current status and writes the administrator to history atomically", async () => {
    findUnique.mockResolvedValue({ id: BigInt(42), publicNumber: "VS-ORDER42", status: "NEW" });
    updateMany.mockResolvedValue({ count: 1 });
    createHistory.mockResolvedValue({ id: BigInt(7) });

    await expect(
      updateOrderStatus(
        { orderNumber: "vs-order42", status: "CONFIRMED" },
        "admin-1",
        runTransaction,
      ),
    ).resolves.toEqual(expect.objectContaining({ orderNumber: "VS-ORDER42", status: "CONFIRMED" }));
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(42), status: "NEW" },
      data: { status: "CONFIRMED", updatedAt: expect.any(Date) },
    });
    expect(createHistory).toHaveBeenCalledWith({
      data: {
        orderId: BigInt(42),
        previousStatus: "NEW",
        newStatus: "CONFIRMED",
        changedByUserId: "admin-1",
      },
      select: { id: true },
    });
  });

  it("rejects an invalid transition before either write", async () => {
    findUnique.mockResolvedValue({
      id: BigInt(42),
      publicNumber: "VS-ORDER42",
      status: "COMPLETED",
    });

    await expect(
      updateOrderStatus(
        { orderNumber: "VS-ORDER42", status: "IN_PROGRESS" },
        "admin-1",
        runTransaction,
      ),
    ).rejects.toThrow("Order status transition is not allowed");
    expect(updateMany).not.toHaveBeenCalled();
    expect(createHistory).not.toHaveBeenCalled();
  });

  it("turns a lost concurrent update into a conflict without writing history", async () => {
    findUnique.mockResolvedValue({ id: BigInt(42), publicNumber: "VS-ORDER42", status: "NEW" });
    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      updateOrderStatus(
        { orderNumber: "VS-ORDER42", status: "CANCELLED" },
        "admin-1",
        runTransaction,
      ),
    ).rejects.toBeInstanceOf(ConcurrentOrderStatusUpdateError);
    expect(createHistory).not.toHaveBeenCalled();
  });

  it("returns not found without attempting writes", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      updateOrderStatus(
        { orderNumber: "VS-MISSING", status: "CONFIRMED" },
        "admin-1",
        runTransaction,
      ),
    ).rejects.toBeInstanceOf(OrderStatusUpdateNotFoundError);
    expect(updateMany).not.toHaveBeenCalled();
    expect(createHistory).not.toHaveBeenCalled();
  });
});
