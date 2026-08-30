import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));

describe("catalog server queries", () => {
  it("selects and orders only public category fields", async () => {
    const { categorySelect, findPublicCategories } =
      await import("@/modules/catalog/server/queries");
    const findMany = jest.fn(async () => []);

    await findPublicCategories({ category: { findMany }, product: {} } as never);

    expect(findMany).toHaveBeenCalledWith({
      select: categorySelect,
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
  });

  it("lists active products with a stable category cursor", async () => {
    const { findPublicProductPage, productPreviewSelect } =
      await import("@/modules/catalog/server/queries");
    const findMany = jest.fn(async () => []);
    const cursor = { id: BigInt(42), createdAt: new Date("2026-08-30T12:00:00.000Z") };

    await findPublicProductPage({ categorySlug: "sofas", cursor, take: 25 }, {
      category: {},
      product: { findMany },
    } as never);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: { slug: "sofas" },
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      },
      select: productPreviewSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 25,
    });
  });

  it("does not return inactive product details", async () => {
    const { findPublicProductBySlug, productDetailSelect } =
      await import("@/modules/catalog/server/queries");
    const findFirst = jest.fn(async () => null);

    await findPublicProductBySlug("cloud-sofa", {
      category: {},
      product: { findFirst },
    } as never);

    expect(findFirst).toHaveBeenCalledWith({
      where: { slug: "cloud-sofa", isActive: true },
      select: productDetailSelect,
    });
  });
});
