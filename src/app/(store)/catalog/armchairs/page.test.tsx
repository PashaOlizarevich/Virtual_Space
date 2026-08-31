import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { armchairCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(armchairCategoryProducts));
});

describe("armchairs category", () => {
  it("renders the category description and four linked products", async () => {
    const { default: ArmchairsPage } = await import("@/app/(store)/catalog/armchairs/page");
    const html = renderToStaticMarkup(await ArmchairsPage());

    expect(html).toContain("Кресло создаёт личное пространство для чтения");
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain("Кресло Forma");
    expect(html).toContain("Кресло Aster");
    expect(html).toContain("Кресло Runa");
    expect(html).toContain("Кресло Vero");
    expect(html).toContain('href="/product/aster-armchair"');
    expect(html).toContain('href="/product/runa-armchair"');
    expect(html).toContain('href="/product/vero-armchair"');
    expect(html).toContain('href="/product/forma-armchair"');
  });
});
