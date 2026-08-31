import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { bedCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(bedCategoryProducts));
});

describe("beds category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: BedsPage } = await import("@/app/(store)/catalog/beds/page");
    const html = renderToStaticMarkup(await BedsPage());

    expect(html).toContain("Кровати, созданные для глубокого и спокойного сна");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Кровать Nubi");
    expect(html).toContain("Кровать Ardea");
    expect(html).toContain("Кровать Linea");
  });
});
