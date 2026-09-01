import { afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { CartProductRecord } from "@/modules/orders/server/queries";
import type {
  CreatedOrderNotifier,
  OrderCreationTransaction,
  TransactionRunner,
} from "@/modules/orders/server/order-creation";

let createGuestOrder: (typeof import("@/modules/orders/server/order-creation"))["createGuestOrder"];

beforeAll(async () => {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  ({ createGuestOrder } = await import("@/modules/orders/server/order-creation"));
});

afterEach(() => {
  jest.restoreAllMocks();
});

const input = {
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
        selectedOptions: [{ groupId: "color", optionId: "milk" }],
        observedPrice: 1390,
      },
    ],
  },
};

function createTransactionRunner(events: string[]): TransactionRunner {
  const product: CartProductRecord = {
    id: BigInt(1),
    name: "Кресло Forma",
    price: { toFixed: () => "1390.00" } as CartProductRecord["price"],
    currency: "BYN",
    stock: 1,
    isActive: true,
    optionGroups: [{ key: "color", label: "Цвет", options: [{ key: "milk", label: "Молочный" }] }],
  };
  const transaction = {
    product: {
      findMany: jest.fn(async () => [product]),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    order: {
      create: jest.fn(async () => ({
        publicNumber: "VS-TESTORDER001",
        total: { toFixed: () => "1390.00" },
        currency: "BYN" as const,
        status: "NEW" as const,
      })),
    },
  };

  return async <Result>(operation: (client: OrderCreationTransaction) => Promise<Result>) => {
    const result = await operation(transaction as unknown as OrderCreationTransaction);
    events.push("commit");
    return result;
  };
}

describe("post-commit order notification", () => {
  it("notifies only after the transaction runner has committed", async () => {
    const events: string[] = [];
    const notify: CreatedOrderNotifier = jest.fn(async () => {
      events.push("notify");
    });

    await createGuestOrder(input, createTransactionRunner(events), () => "VS-TESTORDER001", notify);

    expect(events).toEqual(["commit", "notify"]);
    expect(notify).toHaveBeenCalledWith({
      orderNumber: "VS-TESTORDER001",
      total: { amount: "1390.00", currency: "BYN" },
      status: "NEW",
    });
  });

  it("returns the committed order when Telegram delivery fails", async () => {
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const notify: CreatedOrderNotifier = jest.fn(async () => {
      throw new Error("Telegram unavailable");
    });

    await expect(
      createGuestOrder(input, createTransactionRunner([]), () => "VS-TESTORDER001", notify),
    ).resolves.toEqual({
      orderNumber: "VS-TESTORDER001",
      total: { amount: "1390.00", currency: "BYN" },
      status: "NEW",
    });
    expect(errorLog).toHaveBeenCalledWith("Telegram order notification failed after order commit");
  });

  it("does not notify when the transaction does not commit", async () => {
    const transactionError = new Error("Transaction failed");
    const executeTransaction: TransactionRunner = async () => {
      throw transactionError;
    };
    const notify: CreatedOrderNotifier = jest.fn(async () => undefined);

    await expect(
      createGuestOrder(input, executeTransaction, () => "VS-TESTORDER001", notify),
    ).rejects.toBe(transactionError);
    expect(notify).not.toHaveBeenCalled();
  });
});
