import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { CatalogCategoryShowcase } from "@/modules/catalog/components/catalog-category-showcase";

describe("CatalogCategoryShowcase", () => {
  it("renders all catalog categories as complete links", () => {
    const html = renderToStaticMarkup(<CatalogCategoryShowcase />);

    const routes = [
      "sofas",
      "armchairs",
      "poufs",
      "chairs",
      "dining-tables",
      "living-room-tables",
      "beds",
      "mattresses",
      "textiles-decor",
      "tableware",
    ];

    expect(html.match(/class="catalog-category /g)).toHaveLength(10);
    expect(html.match(/Смотреть коллекцию/g)).toHaveLength(10);
    for (const route of routes) {
      expect(html).toContain(`href="/catalog/${route}"`);
      expect(html).toContain(`%2Fimages%2Fcatalog-categories%2F${route}.png`);
    }
  });
});
