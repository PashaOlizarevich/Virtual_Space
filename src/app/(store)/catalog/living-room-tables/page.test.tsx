import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { livingRoomTableCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(livingRoomTableCategoryProducts));
});

describe("living room tables category", () => {
  it("renders the category description and exactly three products", async () => {
    const { default: LivingRoomTablesPage } =
      await import("@/app/(store)/catalog/living-room-tables/page");
    const html = renderToStaticMarkup(await LivingRoomTablesPage());

    expect(html).toContain("Стол в гостиной объединяет зону отдыха");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Стол Riva");
    expect(html).toContain("Стол Orsa");
    expect(html).toContain("Стол Plano");
  });
});
