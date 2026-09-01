import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/server/user-auth", () => ({ requireUser: jest.fn() }));

const principal = {
  id: "user-1",
  name: "Анна",
  email: "user@example.com",
  phone: null,
  role: "USER" as const,
  credentialsVersion: 0,
  deletedAt: null,
};

const decimal = (amount: string) => ({
  toFixed: () => amount,
  equals: (other: { toFixed(fractionDigits: number): string }) => other.toFixed(2) === amount,
});

function transactionRunner(transaction: object) {
  return async <Result>(operation: (client: never) => Promise<Result>) =>
    operation(transaction as never);
}

describe("guest and server cart merge", () => {
  it("merges canonical configurations atomically and persists only server-owned price", async () => {
    const { mergeGuestCart } = await import("@/modules/cart/server/cart-merge");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const serverPrice = decimal("1390.00");
    const upsertItem = jest.fn(async () => ({}));
    const transaction = {
      product: {
        findMany: jest.fn(async () => [
          {
            id: BigInt(7),
            price: serverPrice,
            stock: 10,
            isActive: true,
            optionGroups: [
              { key: "color", options: [{ key: "milk" }] },
              { key: "size", options: [{ key: "large" }] },
            ],
          },
        ]),
      },
      cart: {
        upsert: jest.fn(async () => ({ id: BigInt(3) })),
        findUnique: jest.fn(async () => ({ items: [] })),
      },
      cartItem: {
        findMany: jest.fn(async () => [
          { productId: BigInt(7), optionsKey: "4:size5:large|5:color4:milk", quantity: 1 },
        ]),
        upsert: upsertItem,
      },
    };

    await mergeGuestCart(
      {
        items: [
          {
            productId: "7",
            quantity: 2,
            selectedOptions: [
              { groupId: "size", optionId: "large" },
              { groupId: "color", optionId: "milk" },
            ],
          },
          {
            productId: "7",
            quantity: 1,
            selectedOptions: [
              { groupId: "color", optionId: "milk" },
              { groupId: "size", optionId: "large" },
            ],
          },
        ],
      },
      transactionRunner(transaction),
    );

    expect(transaction.cartItem.findMany).toHaveBeenCalledWith({
      where: { cart: { userId: "user-1" } },
      select: { productId: true, optionsKey: true, quantity: true },
    });
    expect(upsertItem).toHaveBeenCalledTimes(1);
    expect(upsertItem).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ quantity: 4, observedPrice: serverPrice }),
        update: expect.objectContaining({ quantity: 4, observedPrice: serverPrice }),
      }),
    );
  });

  it("rejects unavailable or overstocked items without writing a partial merge", async () => {
    const { CartMergeConflictError, mergeGuestCart } =
      await import("@/modules/cart/server/cart-merge");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const cartUpsert = jest.fn();
    const itemUpsert = jest.fn();
    const transaction = {
      product: {
        findMany: jest.fn(async () => [
          {
            id: BigInt(7),
            price: decimal("1390.00"),
            stock: 2,
            isActive: true,
            optionGroups: [{ key: "color", options: [{ key: "milk" }] }],
          },
        ]),
      },
      cart: { upsert: cartUpsert },
      cartItem: {
        findMany: jest.fn(async () => [
          { productId: BigInt(7), optionsKey: "5:color4:milk", quantity: 1 },
        ]),
        upsert: itemUpsert,
      },
    };

    await expect(
      mergeGuestCart(
        {
          items: [
            {
              productId: "7",
              quantity: 2,
              selectedOptions: [{ groupId: "color", optionId: "milk" }],
            },
            { productId: "8", quantity: 1, selectedOptions: [] },
          ],
        },
        transactionRunner(transaction),
      ),
    ).rejects.toBeInstanceOf(CartMergeConflictError);
    expect(cartUpsert).not.toHaveBeenCalled();
    expect(itemUpsert).not.toHaveBeenCalled();
  });

  it("rejects price mass assignment before reading authentication", async () => {
    const { CartMergeInputError, mergeGuestCart } =
      await import("@/modules/cart/server/cart-merge");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockClear();

    await expect(
      mergeGuestCart({
        items: [{ productId: "7", quantity: 1, selectedOptions: [], observedPrice: 1 }],
      }),
    ).rejects.toBeInstanceOf(CartMergeInputError);
    expect(requireUser).not.toHaveBeenCalled();
  });
});
