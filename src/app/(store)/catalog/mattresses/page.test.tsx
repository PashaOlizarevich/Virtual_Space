import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { mattressCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(mattressCategoryProducts));
});

describe("mattresses category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: MattressesPage } = await import("@/app/(store)/catalog/mattresses/page");
    const html = renderToStaticMarkup(await MattressesPage());

    expect(html).toContain("Матрасы для полноценного отдыха и естественного восстановления");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Матрас Alba");
    expect(html).toContain("Матрас Forma");
    expect(html).toContain("Матрас Noma");
  });
});
