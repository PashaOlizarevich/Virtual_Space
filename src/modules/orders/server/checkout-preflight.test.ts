import { beforeAll, describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { CartProductRecord } from "@/modules/orders/server/queries";

let preflightGuestCheckout: (
  input: unknown,
) => ReturnType<
  (typeof import("@/modules/orders/server/checkout-preflight"))["preflightGuestCheckout"]
>;
let findMany: jest.Mock<() => Promise<CartProductRecord[]>>;

beforeAll(async () => {
  findMany = jest.fn<() => Promise<CartProductRecord[]>>();
  const database = await import("@/server/db");
  Object.assign(database.db, { product: { findMany } });
  ({ preflightGuestCheckout } = await import("@/modules/orders/server/checkout-preflight"));
});

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

function cart(observedPrice: number) {
  return {
    items: [
      {
        productId: "1",
        quantity: 2,
        selectedOptions: [{ groupId: "color", optionId: "milk" }],
        observedPrice,
      },
    ],
  };
}

describe("guest checkout preflight", () => {
  it("returns a controlled price conflict with the current server value", async () => {
    findMany.mockResolvedValue([product()]);

    await expect(preflightGuestCheckout(cart(1290))).resolves.toEqual({
      status: "CONFLICT",
      issues: [
        {
          productId: "1",
          code: "PRICE_CHANGED",
          currentPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    });
  });

  it("becomes ready only after the current price is submitted again", async () => {
    findMany.mockResolvedValue([product()]);

    await expect(preflightGuestCheckout(cart(1390))).resolves.toEqual({
      status: "READY",
      items: [
        {
          productId: "1",
          name: "Кресло Forma",
          quantity: 2,
          selectedOptions: [
            {
              groupId: "color",
              groupLabel: "Цвет",
              optionId: "milk",
              optionLabel: "Молочный",
            },
          ],
          unitPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    });
  });

  it("never exposes partially validated items as ready", async () => {
    findMany.mockResolvedValue([product()]);

    await expect(
      preflightGuestCheckout({ items: [cart(1390).items[0], cart(1290).items[0]] }),
    ).resolves.toEqual({
      status: "CONFLICT",
      issues: [
        {
          productId: "1",
          code: "PRICE_CHANGED",
          currentPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    });
  });
});
