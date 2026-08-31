import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";

import { CatalogQueryGridView } from "@/modules/catalog/components/catalog-query-grid";
import { allProducts, products, sofaCategoryProducts } from "@/modules/catalog/mock-data";
import { catalogResult, toProductDto } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({
  getPublicCatalog: jest.fn(),
  getPublicProductBySlug: jest.fn(),
}));

beforeEach(async () => {
  const { getPublicCatalog, getPublicProductBySlug } =
    await import("@/modules/catalog/server/service");

  jest
    .mocked(getPublicCatalog)
    .mockImplementation(async (input = {}) =>
      catalogResult(input.categorySlug === "sofas" ? sofaCategoryProducts : products),
    );
  jest.mocked(getPublicProductBySlug).mockImplementation(async (slug) => {
    const product = allProducts.find((item) => item.slug === slug);
    return product ? toProductDto(product) : null;
  });
});

describe("catalog routes", () => {
  it("renders the sofas category with five products", async () => {
    const { default: SofasPage } = await import("@/app/(store)/catalog/sofas/page");
    const html = renderToStaticMarkup(await SofasPage());

    expect(html).toContain("Диваны для долгих разговоров");
    expect(html.match(/class="product-preview"/g)).toHaveLength(5);
    expect(html).toContain("Диван Modul");
    expect(html).toContain("Диван Aura");
  });

  it("renders the server-loaded catalog collection", async () => {
    const { default: CatalogPage } = await import("@/app/(store)/catalog/page");
    const queryClient = new QueryClient();
    const page = await CatalogPage();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>{page}</QueryClientProvider>,
    );
    expect(html).toContain("Мебель и детали для отдыха");
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain("В коллекции: 4");
  });

  it("renders loaded products without navigation below the desktop limit", () => {
    const html = renderToStaticMarkup(<CatalogQueryGridView products={products} />);
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain('href="/product/forma-armchair"');
    expect(html).toContain("Обновить");
  });

  it("renders empty and error states", () => {
    const empty = renderToStaticMarkup(<CatalogQueryGridView products={[]} />);
    const error = renderToStaticMarkup(<CatalogQueryGridView error={new Error("offline")} />);

    expect(empty).toContain("Каталог пока пуст");
    expect(error).toContain("Не удалось загрузить каталог");
    expect(error).toContain("Повторить");
  });

  it("renders product data, options and specifications", async () => {
    const { default: ProductPage } = await import("@/app/(store)/product/[id]/page");
    const page = await ProductPage({ params: Promise.resolve({ id: "forma-armchair" }) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain("Кресло Forma");
    expect(html).toContain("Характеристики");
    expect(html).toContain("Молочный");
    expect(html).toContain("Добавить в корзину");
  });
});
