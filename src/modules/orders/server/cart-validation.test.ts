import { beforeAll, describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("@/server/db", () => ({ db: {} }));

import type { CartProductRecord } from "@/modules/orders/server/queries";

let validateGuestCart: (typeof import("@/modules/orders/server/cart-validation"))["validateGuestCart"];

beforeAll(async () => {
  ({ validateGuestCart } = await import("@/modules/orders/server/cart-validation"));
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
  items: [
    {
      productId: "1",
      quantity: 2,
      selectedOptions: [{ groupId: "color", optionId: "milk" }],
      observedPrice: 1390,
    },
  ],
};

describe("guest cart server validation", () => {
  it("loads unique products and returns server-owned order snapshots", async () => {
    const loadProducts = jest.fn(async () => [product()]);

    await expect(validateGuestCart(input, loadProducts)).resolves.toEqual({
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
      issues: [],
    });
    expect(loadProducts).toHaveBeenCalledWith([BigInt(1)]);
  });

  it.each<
    [
      "PRODUCT_UNAVAILABLE" | "INSUFFICIENT_STOCK" | "INVALID_CONFIGURATION",
      CartProductRecord | undefined,
    ]
  >([
    ["PRODUCT_UNAVAILABLE", undefined],
    ["PRODUCT_UNAVAILABLE", product({ isActive: false })],
    ["INSUFFICIENT_STOCK", product({ stock: 1 })],
    ["INVALID_CONFIGURATION", product({ optionGroups: [] })],
  ])("reports %s without accepting an invalid line", async (code, currentProduct) => {
    const result = await validateGuestCart(input, async () =>
      currentProduct ? [currentProduct] : [],
    );

    expect(result).toEqual({ items: [], issues: [{ productId: "1", code }] });
  });

  it("returns the exact current price when the client price changed", async () => {
    const result = await validateGuestCart(
      { items: [{ ...input.items[0], observedPrice: 1290 }] },
      async () => [product()],
    );

    expect(result).toEqual({
      items: [],
      issues: [
        {
          productId: "1",
          code: "PRICE_CHANGED",
          currentPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    });
  });

  it("checks stock across separate configurations of the same product", async () => {
    const result = await validateGuestCart(
      { items: [input.items[0], { ...input.items[0], quantity: 3 }] },
      async () => [product()],
    );

    expect(result.items).toEqual([]);
    expect(result.issues).toEqual([
      { productId: "1", code: "INSUFFICIENT_STOCK" },
      { productId: "1", code: "INSUFFICIENT_STOCK" },
    ]);
  });

  it("rejects malformed, oversized and duplicate-option input before querying", async () => {
    const loadProducts = jest.fn(async () => [product()]);

    await expect(
      validateGuestCart(
        {
          items: [
            {
              ...input.items[0],
              selectedOptions: [
                { groupId: "color", optionId: "milk" },
                { groupId: "color", optionId: "black" },
              ],
            },
          ],
        },
        loadProducts,
      ),
    ).rejects.toThrow();
    expect(loadProducts).not.toHaveBeenCalled();
  });
});
