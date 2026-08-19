import { describe, expect, it } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";

import CatalogPage from "@/app/(store)/catalog/page";
import SofasPage from "@/app/(store)/catalog/sofas/page";
import ProductPage from "@/app/(store)/product/[id]/page";
import { CatalogQueryGridView } from "@/modules/catalog/components/catalog-query-grid";
import { products } from "@/modules/catalog/mock-data";

describe("catalog routes", () => {
  it("renders the sofas category with five products", () => {
    const html = renderToStaticMarkup(<SofasPage />);

    expect(html).toContain("Диваны для долгих разговоров");
    expect(html.match(/class="product-preview"/g)).toHaveLength(5);
    expect(html).toContain("Диван Modul");
    expect(html).toContain("Диван Aura");
  });

  it("renders the asynchronous catalog loading state", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <CatalogPage />
      </QueryClientProvider>,
    );
    expect(html).toContain("Мебель для спокойного дома");
    expect(html).toContain("Загрузка товара 1");
  });

  it("renders every loaded product and refresh control", () => {
    const html = renderToStaticMarkup(<CatalogQueryGridView products={products} />);
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain('href="/product/forma-chair"');
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
    const page = await ProductPage({ params: Promise.resolve({ id: "forma-chair" }) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain("Кресло Forma");
    expect(html).toContain("Характеристики");
    expect(html).toContain("Молочный");
    expect(html).toContain("Добавить в корзину");
  });
});
