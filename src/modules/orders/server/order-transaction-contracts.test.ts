import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { CartProductRecord } from "@/modules/orders/server/queries";
import type {
  OrderCreationTransaction,
  TransactionRunner,
} from "@/modules/orders/server/order-creation";
import type { OrderStatusTransactionRunner } from "@/modules/orders/server/order-status-update";

let createGuestOrder: (typeof import("@/modules/orders/server/order-creation"))["createGuestOrder"];
let updateOrderStatus: (typeof import("@/modules/orders/server/order-status-update"))["updateOrderStatus"];

beforeAll(async () => {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  ({ createGuestOrder } = await import("@/modules/orders/server/order-creation"));
  ({ updateOrderStatus } = await import("@/modules/orders/server/order-status-update"));
});

const checkoutInput = {
  contact: {
    name: "Анна",
    phone: "+375 29 123-45-67",
    email: "anna@example.com",
    comment: "",
  },
  cart: {
    items: [
      {
        productId: "1",
        quantity: 2,
        selectedOptions: [{ groupId: "color", optionId: "milk" }],
        observedPrice: 1390,
      },
    ],
  },
};

function product(): CartProductRecord {
  return {
    id: BigInt(1),
    name: "Кресло Forma",
    price: { toFixed: () => "1390.00" } as CartProductRecord["price"],
    currency: "BYN",
    stock: 4,
    isActive: true,
    optionGroups: [
      {
        key: "color",
        label: "Цвет",
        options: [{ key: "milk", label: "Молочный" }],
      },
    ],
  };
}

describe("order transaction contracts", () => {
  it("uses server prices and persists complete immutable item snapshots", async () => {
    let createdData: Record<string, unknown> | undefined;
    const transaction = {
      product: {
        findMany: jest.fn(async () => [product()]),
        updateMany: jest.fn(async () => ({ count: 1 })),
      },
      order: {
        create: jest.fn(async (args: { data: Record<string, unknown> }) => {
          createdData = args.data;
          return {
            publicNumber: "VS-SNAPSHOTS01",
            total: { toFixed: () => "2780.00" },
            currency: "BYN" as const,
            status: "NEW" as const,
          };
        }),
      },
    };
    const runTransaction: TransactionRunner = async (operation) =>
      operation(transaction as unknown as OrderCreationTransaction);

    await createGuestOrder(
      checkoutInput,
      runTransaction,
      () => "VS-SNAPSHOTS01",
      async () => {},
    );

    expect(createdData).toEqual(
      expect.objectContaining({
        total: expect.anything(),
        items: {
          create: [
            expect.objectContaining({
              productId: BigInt(1),
              snapshotName: "Кресло Forma",
              snapshotOptions: [
                {
                  groupId: "color",
                  groupLabel: "Цвет",
                  optionId: "milk",
                  optionLabel: "Молочный",
                },
              ],
              snapshotPrice: expect.anything(),
              quantity: 2,
              lineTotal: expect.anything(),
            }),
          ],
        },
        statusHistory: { create: { previousStatus: "NEW", newStatus: "NEW" } },
      }),
    );
    expect(String(createdData?.total)).toBe("2780");
  });

  it("rolls back a stock decrement when order persistence fails", async () => {
    const state = { stock: 4, orders: 0 };
    const transaction = {
      product: {
        findMany: jest.fn(async () => [product()]),
        updateMany: jest.fn(async () => {
          state.stock -= 2;
          return { count: 1 };
        }),
      },
      order: {
        create: jest.fn(async () => {
          throw new Error("order insert failed");
        }),
      },
    };
    const runTransaction: TransactionRunner = async (operation) => {
      const before = { ...state };
      try {
        return await operation(transaction as unknown as OrderCreationTransaction);
      } catch (error) {
        Object.assign(state, before);
        throw error;
      }
    };

    await expect(createGuestOrder(checkoutInput, runTransaction)).rejects.toThrow(
      "order insert failed",
    );
    expect(state).toEqual({ stock: 4, orders: 0 });
  });

  it("rolls back the status update when history persistence fails", async () => {
    const state = { status: "NEW" as "NEW" | "CONFIRMED", historyEntries: 0 };
    const transaction = {
      order: {
        findUnique: jest.fn(async () => ({
          id: BigInt(42),
          publicNumber: "VS-ORDER42",
          status: state.status,
        })),
        updateMany: jest.fn(async () => {
          state.status = "CONFIRMED";
          return { count: 1 };
        }),
      },
      orderStatusHistory: {
        create: jest.fn(async () => {
          throw new Error("history insert failed");
        }),
      },
    };
    const runTransaction: OrderStatusTransactionRunner = async (operation) => {
      const before = { ...state };
      try {
        return await operation(transaction as never);
      } catch (error) {
        Object.assign(state, before);
        throw error;
      }
    };

    await expect(
      updateOrderStatus(
        { orderNumber: "VS-ORDER42", status: "CONFIRMED" },
        "admin-1",
        runTransaction,
      ),
    ).rejects.toThrow("history insert failed");
    expect(state).toEqual({ status: "NEW", historyEntries: 0 });
  });
});
