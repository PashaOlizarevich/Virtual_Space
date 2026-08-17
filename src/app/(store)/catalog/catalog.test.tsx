import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import CatalogPage from "@/app/(store)/catalog/page";
import ProductPage from "@/app/(store)/product/[id]/page";

describe("catalog routes", () => {
  it("renders every mocked product in the catalog", () => {
    const html = renderToStaticMarkup(<CatalogPage />);
    expect(html).toContain("Мебель для спокойного дома");
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain('href="/product/forma-chair"');
  });

  it("renders product data, options and specifications", async () => {
    const page = await ProductPage({ params: Promise.resolve({ id: "forma-chair" }) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain("Кресло Forma");
    expect(html).toContain("Характеристики");
    expect(html).toContain("Молочный");
    expect(html).toContain("Добавить в корзину");
  });
});
