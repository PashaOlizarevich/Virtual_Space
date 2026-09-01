import "server-only";

import type { OrderStatus, Prisma, PrismaClient } from "@prisma/client";

import {
  adminOrderStatusUpdateSchema,
  type AdminOrderStatusUpdateInput,
} from "@/modules/orders/server/read-schemas";
import { assertOrderStatusTransition } from "@/modules/orders/server/status-transitions";
import { db } from "@/server/db";

type OrderStatusTransaction = Pick<Prisma.TransactionClient, "order" | "orderStatusHistory">;
export type OrderStatusTransactionRunner = <Result>(
  operation: (transaction: OrderStatusTransaction) => Promise<Result>,
) => Promise<Result>;

export type AdminOrderStatusDto = Readonly<{
  orderNumber: string;
  status: OrderStatus;
  updatedAt: string;
}>;

export class OrderStatusUpdateNotFoundError extends Error {
  constructor() {
    super("Order not found");
    this.name = "OrderStatusUpdateNotFoundError";
  }
}

export class ConcurrentOrderStatusUpdateError extends Error {
  constructor() {
    super("Order status changed concurrently");
    this.name = "ConcurrentOrderStatusUpdateError";
  }
}

function createTransactionRunner(database: PrismaClient): OrderStatusTransactionRunner {
  return (operation) => database.$transaction(operation);
}

export async function updateOrderStatus(
  input: AdminOrderStatusUpdateInput,
  changedByUserId: string,
  runTransaction: OrderStatusTransactionRunner = createTransactionRunner(db),
): Promise<AdminOrderStatusDto> {
  const update = adminOrderStatusUpdateSchema.parse(input);

  return runTransaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { publicNumber: update.orderNumber },
      select: { id: true, publicNumber: true, status: true },
    });
    if (!order) throw new OrderStatusUpdateNotFoundError();

    assertOrderStatusTransition(order.status, update.status);

    const updatedAt = new Date();
    const result = await transaction.order.updateMany({
      where: { id: order.id, status: order.status },
      data: { status: update.status, updatedAt },
    });
    if (result.count !== 1) throw new ConcurrentOrderStatusUpdateError();

    await transaction.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: update.status,
        changedByUserId,
      },
      select: { id: true },
    });

    return {
      orderNumber: order.publicNumber,
      status: update.status,
      updatedAt: updatedAt.toISOString(),
    };
  });
}
