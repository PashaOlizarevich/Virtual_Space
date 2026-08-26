import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { NewArrivalsView } from "@/app/(store)/new/page";
import { Header } from "@/components/layout/header";
import { allProducts } from "@/modules/catalog/mock-data";
import { getActiveNewArrivals } from "@/modules/catalog/new-arrivals";

describe("new arrivals page", () => {
  it("renders only active new arrivals with a textual badge", () => {
    const products = getActiveNewArrivals(allProducts, new Date("2026-08-26T12:00:00.000Z"));
    const html = renderToStaticMarkup(<NewArrivalsView products={products} />);

    expect(products).toHaveLength(3);
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html.match(/>Новинка</g)).toHaveLength(3);
    expect(html.indexOf("Набор тарелок Lumo")).toBeLessThan(html.indexOf("Стул Noma"));
    expect(html.indexOf("Стул Noma")).toBeLessThan(html.indexOf("Диван Lento"));
  });

  it("renders an accessible empty state linked to the catalog", () => {
    const html = renderToStaticMarkup(<NewArrivalsView products={[]} />);

    expect(html).toContain("Новых поступлений пока нет");
    expect(html).toContain('href="/catalog"');
  });

  it("links desktop and mobile navigation to the new arrivals route", () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html.match(/href="\/new"/g)).toHaveLength(2);
    expect(html).toContain('href="/catalog">Акции</a>');
  });
});
