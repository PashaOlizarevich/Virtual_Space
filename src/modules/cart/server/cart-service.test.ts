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

const cartItem = (overrides: Record<string, unknown> = {}) => ({
  productId: BigInt(7),
  selectedOptions: [{ groupId: "color", optionId: "milk" }],
  optionsKey: "5:color4:milk",
  quantity: 2,
  observedPrice: decimal("1290.00"),
  product: {
    name: "Кресло",
    price: decimal("1390.00"),
    currency: "BYN" as const,
    stock: 5,
    isActive: true,
    optionGroups: [{ key: "color", label: "Цвет", options: [{ key: "milk", label: "Молочный" }] }],
  },
  ...overrides,
});

describe("server cart service", () => {
  it("revalidates product, options, price and aggregate stock while mapping safe DTOs", async () => {
    const { getServerCart } = await import("@/modules/cart/server/cart-service");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const findUnique = jest.fn(async () => ({
      items: [cartItem(), cartItem({ optionsKey: "5:color4:sand", quantity: 4 })],
    }));

    const result = await getServerCart({ cart: { findUnique } } as never);

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
    expect(result.items).toEqual([
      expect.objectContaining({
        productId: "7",
        observedPrice: { amount: "1290.00", currency: "BYN" },
        currentPrice: { amount: "1390.00", currency: "BYN" },
        status: "INSUFFICIENT_STOCK",
      }),
      expect.objectContaining({ status: "INSUFFICIENT_STOCK" }),
    ]);
  });

  it("updates only the authenticated user's matching configuration with the server price", async () => {
    const { updateServerCartItemQuantity } = await import("@/modules/cart/server/cart-service");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const price = decimal("1390.00");
    const productFindUnique = jest.fn(async () => ({
      price,
      stock: 5,
      isActive: true,
      optionGroups: [{ key: "color", options: [{ key: "milk" }] }],
    }));
    const updateMany = jest.fn(async () => ({ count: 1 }));
    const cartItemFindMany = jest.fn(async () => [{ optionsKey: "5:color4:milk", quantity: 1 }]);
    const cartFindUnique = jest.fn(async () => ({ items: [cartItem({ observedPrice: price })] }));

    await updateServerCartItemQuantity(
      {
        productId: "7",
        quantity: 2,
        selectedOptions: [{ groupId: "color", optionId: "milk" }],
      },
      {
        product: { findUnique: productFindUnique },
        cartItem: { updateMany, findMany: cartItemFindMany },
        cart: { findUnique: cartFindUnique },
      } as never,
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        productId: BigInt(7),
        optionsKey: "5:color4:milk",
        cart: { userId: "user-1" },
      },
      data: { quantity: 2, observedPrice: price },
    });
  });

  it("rejects mass assignment before authentication", async () => {
    const { updateServerCartItemQuantity, CartInputError } =
      await import("@/modules/cart/server/cart-service");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockClear();

    await expect(
      updateServerCartItemQuantity({
        productId: "7",
        quantity: 1,
        selectedOptions: [],
        observedPrice: 1,
      }),
    ).rejects.toBeInstanceOf(CartInputError);
    expect(requireUser).not.toHaveBeenCalled();
  });

  it("rejects quantity when other configurations exhaust the product stock", async () => {
    const { updateServerCartItemQuantity } = await import("@/modules/cart/server/cart-service");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const database = {
      product: {
        findUnique: jest.fn(async () => ({
          price: decimal("1390.00"),
          stock: 5,
          isActive: true,
          optionGroups: [{ key: "color", options: [{ key: "milk" }] }],
        })),
      },
      cartItem: {
        findMany: jest.fn(async () => [
          { optionsKey: "5:color4:milk", quantity: 1 },
          { optionsKey: "5:color4:sand", quantity: 4 },
        ]),
      },
    };

    await expect(
      updateServerCartItemQuantity(
        {
          productId: "7",
          quantity: 2,
          selectedOptions: [{ groupId: "color", optionId: "milk" }],
        },
        database as never,
      ),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_STOCK" });
  });

  it("deletes through an ownership-scoped predicate", async () => {
    const { removeServerCartItem } = await import("@/modules/cart/server/cart-service");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockResolvedValue(principal);
    const deleteMany = jest.fn(async () => ({ count: 1 }));
    const findUnique = jest.fn(async () => ({ items: [] }));

    await removeServerCartItem(
      { productId: "7", selectedOptions: [{ groupId: "color", optionId: "milk" }] },
      { cartItem: { deleteMany }, cart: { findUnique } } as never,
    );

    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        productId: BigInt(7),
        optionsKey: "5:color4:milk",
        cart: { userId: "user-1" },
      },
    });
  });
});
