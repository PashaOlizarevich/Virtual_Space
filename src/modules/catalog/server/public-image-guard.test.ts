import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import type {
  CategoryRecord,
  ProductDetailRecord,
  ProductPreviewRecord,
} from "@/modules/catalog/server/queries";

const findPublicCategories = jest.fn<() => Promise<CategoryRecord[]>>();
const findPublicProductPage = jest.fn<(query: unknown) => Promise<ProductPreviewRecord[]>>();
const findPublicProductBySlug = jest.fn<(slug: string) => Promise<ProductDetailRecord | null>>();

jest.mock("@/modules/catalog/server/queries", () => ({
  findPublicCategories,
  findPublicProductPage,
  findPublicProductBySlug,
}));

const product = {
  id: BigInt(42),
  slug: "cloud-sofa",
  name: "Cloud Sofa",
  description: "A sufficiently detailed product description.",
  price: { toFixed: () => "120.00" },
  currency: "BYN",
  newFrom: null,
  newUntil: null,
  createdAt: new Date("2026-09-03T12:00:00.000Z"),
  images: [],
} as unknown as ProductPreviewRecord;

describe("public catalog image guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findPublicCategories.mockResolvedValue([]);
  });

  it("skips active products without images instead of failing the catalog", async () => {
    findPublicProductPage.mockResolvedValue([product]);
    const { getPublicCatalog } = await import("@/modules/catalog/server/service");

    await expect(getPublicCatalog()).resolves.toMatchObject({ products: [], nextCursor: null });
  });

  it("does not expose a detail page for a product without images", async () => {
    findPublicProductBySlug.mockResolvedValue({
      ...product,
      specifications: [],
      optionGroups: [],
    } as ProductDetailRecord);
    const { getPublicProductBySlug } = await import("@/modules/catalog/server/service");

    await expect(getPublicProductBySlug("cloud-sofa")).resolves.toBeNull();
  });
});
