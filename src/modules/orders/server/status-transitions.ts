import "server-only";

import { OrderStatus } from "@prisma/client";

export const orderStatusTransitions = {
  [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
} as const satisfies Readonly<Record<OrderStatus, readonly OrderStatus[]>>;

export class InvalidOrderStatusTransitionError extends Error {
  constructor(
    readonly currentStatus: OrderStatus,
    readonly nextStatus: OrderStatus,
  ) {
    super("Order status transition is not allowed");
    this.name = "InvalidOrderStatusTransitionError";
  }
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  return (orderStatusTransitions[currentStatus] as readonly OrderStatus[]).includes(nextStatus);
}

export function assertOrderStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): void {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw new InvalidOrderStatusTransitionError(currentStatus, nextStatus);
  }
}
