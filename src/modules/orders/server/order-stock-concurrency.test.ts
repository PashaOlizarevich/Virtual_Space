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
        quantity: 1,
        selectedOptions: [],
        observedPrice: 1390,
      },
    ],
  },
};

function product(stock: number): CartProductRecord {
  return {
    id: BigInt(1),
    name: "Кресло Forma",
    price: { toFixed: () => "1390.00" } as CartProductRecord["price"],
    currency: "BYN",
    stock,
    isActive: true,
    optionGroups: [],
  };
}

describe("order stock concurrency", () => {
  it("allows only one concurrent checkout of the last unit", async () => {
    const state = { stock: 1, orders: 0 };
    let waitingReads = 0;
    let releaseReads: (() => void) | undefined;
    const bothTransactionsRead = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });

    const createRunner = (): TransactionRunner => async (operation) => {
      const transaction = {
        product: {
          findMany: jest.fn(async () => {
            const snapshot = product(state.stock);
            waitingReads += 1;
            if (waitingReads === 2) releaseReads?.();
            await bothTransactionsRead;
            return [snapshot];
          }),
          updateMany: jest.fn(async () => {
            if (state.stock < 1) return { count: 0 };
            state.stock -= 1;
            return { count: 1 };
          }),
        },
        order: {
          create: jest.fn(async () => {
            state.orders += 1;
            return {
              publicNumber: `VS-CONCURRENT${state.orders}`,
              total: { toFixed: () => "1390.00" },
              currency: "BYN" as const,
              status: "NEW" as const,
            };
          }),
        },
      };

      return operation(transaction as unknown as OrderCreationTransaction);
    };

    const results = await Promise.allSettled([
      createGuestOrder(
        checkoutInput,
        createRunner(),
        () => "VS-CONCURRENT1",
        async () => {},
      ),
      createGuestOrder(
        checkoutInput,
        createRunner(),
        () => "VS-CONCURRENT2",
        async () => {},
      ),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toEqual(
      expect.objectContaining({
        reason: expect.any(OrderCreationConflictError),
      }),
    );
    expect((rejected as PromiseRejectedResult).reason.issues).toEqual([
      { productId: "1", code: "INSUFFICIENT_STOCK" },
    ]);
    expect(state).toEqual({ stock: 0, orders: 1 });
  });
});
