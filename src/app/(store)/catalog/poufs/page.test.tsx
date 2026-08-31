import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { poufCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(poufCategoryProducts));
});

describe("poufs category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: PoufsPage } = await import("@/app/(store)/catalog/poufs/page");
    const html = renderToStaticMarkup(await PoufsPage());

    expect(html).toContain("Пуфики добавляют интерьеру лёгкость и функциональность");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Пуф Arlo");
    expect(html).toContain("Пуф Nola");
    expect(html).toContain("Пуф Taro");
    expect(html).toContain('href="/product/arlo-pouf"');
    expect(html).toContain('href="/product/nola-pouf"');
    expect(html).toContain('href="/product/taro-pouf"');
  });
});
