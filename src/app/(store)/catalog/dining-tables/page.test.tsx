import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { diningTableCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(diningTableCategoryProducts));
});

describe("dining tables category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: DiningTablesPage } = await import("@/app/(store)/catalog/dining-tables/page");
    const html = renderToStaticMarkup(await DiningTablesPage());

    expect(html).toContain("Обеденный стол становится центром дома");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Стол Tavola");
    expect(html).toContain("Стол Orbis");
    expect(html).toContain("Стол Elara");
  });
});
