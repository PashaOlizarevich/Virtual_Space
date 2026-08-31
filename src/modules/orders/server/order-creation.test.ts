import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { CartProductRecord } from "@/modules/orders/server/queries";
import type {
  OrderCreationTransaction,
  TransactionRunner,
} from "@/modules/orders/server/order-creation";

let createGuestOrder: (typeof import("@/modules/orders/server/order-creation"))["createGuestOrder"];
let OrderCreationConflictError: (typeof import("@/modules/orders/server/order-creation"))["OrderCreationConflictError"];

beforeAll(async () => {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  ({ createGuestOrder, OrderCreationConflictError } =
    await import("@/modules/orders/server/order-creation"));
});

function product(overrides: Partial<CartProductRecord> = {}): CartProductRecord {
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
    ...overrides,
  };
}

const input = {
  contact: {
    name: "Анна",
    phone: "+375 29 123-45-67",
    email: "anna@example.com",
    comment: "Позвонить заранее",
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

describe("guest order creation", () => {
  it("decrements stock and creates the complete server-priced order graph atomically", async () => {
    const findMany = jest.fn(async () => [product()]);
    const updateMany = jest.fn(async () => ({ count: 1 }));
    const create = jest.fn(async () => ({
      publicNumber: "VS-TESTORDER001",
      total: { toFixed: () => "2780.00" },
      currency: "BYN" as const,
      status: "NEW" as const,
    }));
    const transaction = { product: { findMany, updateMany }, order: { create } };
    let transactionCalls = 0;
    const executeTransaction: TransactionRunner = async <Result>(
      operation: (client: OrderCreationTransaction) => Promise<Result>,
    ) => {
      transactionCalls += 1;
      return operation(transaction as unknown as OrderCreationTransaction);
    };

    await expect(
      createGuestOrder(input, executeTransaction, () => "VS-TESTORDER001"),
    ).resolves.toEqual({
      orderNumber: "VS-TESTORDER001",
      total: { amount: "2780.00", currency: "BYN" },
      status: "NEW",
    });
    expect(transactionCalls).toBe(1);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(1), isActive: true, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: expect.objectContaining({}),
          items: {
            create: [
              expect.objectContaining({
                snapshotName: "Кресло Forma",
                snapshotPrice: expect.objectContaining({}),
                quantity: 2,
                lineTotal: expect.objectContaining({}),
              }),
            ],
          },
          statusHistory: { create: { previousStatus: "NEW", newStatus: "NEW" } },
        }),
      }),
    );
  });

  it("aborts before order creation when the guarded stock update loses a race", async () => {
    const transaction = {
      product: {
        findMany: jest.fn(async () => [product()]),
        updateMany: jest.fn(async () => ({ count: 0 })),
      },
      order: { create: jest.fn() },
    };
    const executeTransaction: TransactionRunner = async <Result>(
      operation: (client: OrderCreationTransaction) => Promise<Result>,
    ) => operation(transaction as unknown as OrderCreationTransaction);

    await expect(createGuestOrder(input, executeTransaction)).rejects.toBeInstanceOf(
      OrderCreationConflictError,
    );
    expect(transaction.order.create).not.toHaveBeenCalled();
  });
});
