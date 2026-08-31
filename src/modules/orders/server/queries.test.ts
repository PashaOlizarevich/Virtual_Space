import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));

describe("order cart validation queries", () => {
  it("loads only the requested product and option fields in one query", async () => {
    const { cartProductSelect, findCartProducts } = await import("@/modules/orders/server/queries");
    const findMany = jest.fn(async () => []);

    await findCartProducts([BigInt(1), BigInt(2)], {
      product: { findMany },
    } as never);

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: [BigInt(1), BigInt(2)] } },
      select: cartProductSelect,
    });
  });
});
