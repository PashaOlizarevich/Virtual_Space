import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import type { OrderStatus } from "@prisma/client";
import { TextDecoder, TextEncoder } from "node:util";

jest.mock("server-only", () => ({}));

let assertOrderStatusTransition: (currentStatus: OrderStatus, nextStatus: OrderStatus) => void;
let canTransitionOrderStatus: (currentStatus: OrderStatus, nextStatus: OrderStatus) => boolean;
let InvalidOrderStatusTransitionError: (typeof import("@/modules/orders/server/status-transitions"))["InvalidOrderStatusTransitionError"];

beforeAll(async () => {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  ({ assertOrderStatusTransition, canTransitionOrderStatus, InvalidOrderStatusTransitionError } =
    await import("@/modules/orders/server/status-transitions"));
});

const allowedTransitions = new Set([
  "NEW:CONFIRMED",
  "NEW:CANCELLED",
  "CONFIRMED:IN_PROGRESS",
  "CONFIRMED:CANCELLED",
  "IN_PROGRESS:COMPLETED",
  "IN_PROGRESS:CANCELLED",
]);

const statuses = [
  "NEW",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

describe("order status transitions", () => {
  it.each(
    statuses.flatMap((currentStatus) =>
      statuses.map((nextStatus) => [currentStatus, nextStatus] as const),
    ),
  )("validates %s -> %s against the closed transition matrix", (currentStatus, nextStatus) => {
    expect(canTransitionOrderStatus(currentStatus, nextStatus)).toBe(
      allowedTransitions.has(`${currentStatus}:${nextStatus}`),
    );
  });

  it("rejects an invalid transition before subsequent mutation work can run", () => {
    const mutation = jest.fn();

    expect(() => {
      assertOrderStatusTransition("COMPLETED", "IN_PROGRESS");
      mutation();
    }).toThrow(InvalidOrderStatusTransitionError);
    expect(mutation).not.toHaveBeenCalled();
  });

  it("exposes both statuses on the controlled domain error", () => {
    try {
      assertOrderStatusTransition("CANCELLED", "NEW");
      throw new Error("Expected transition validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidOrderStatusTransitionError);
      expect(error).toMatchObject({
        currentStatus: "CANCELLED",
        nextStatus: "NEW",
        message: "Order status transition is not allowed",
      });
    }
  });
});
