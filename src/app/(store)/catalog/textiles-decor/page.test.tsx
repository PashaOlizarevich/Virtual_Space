import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { textilesDecorCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(textilesDecorCategoryProducts));
});

describe("textiles and decor category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: TextilesDecorPage } =
      await import("@/app/(store)/catalog/textiles-decor/page");
    const html = renderToStaticMarkup(await TextilesDecorPage());

    expect(html).toContain("Мягкие фактуры, природные материалы и выразительные детали");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Плед Lino");
    expect(html).toContain("Подушка Miro");
    expect(html).toContain("Ваза Sora");
  });
});
