import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CatalogCategoryShowcase } from "@/modules/catalog/components/catalog-category-showcase";
import { CatalogQueryGridView } from "@/modules/catalog/components/catalog-query-grid";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = { title: "Каталог — Virtual Space" };

type CatalogPageProps = Readonly<{
  searchParams?: Promise<{ page?: string | string[] }>;
}>;

export default async function CatalogPage({ searchParams }: CatalogPageProps = {}) {
  const pageParam = (await searchParams)?.page;
  const initialPageParam = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const catalog = await getPublicCatalog({ pageSize: 100 });

  return (
    <main className="catalog-page">
      <Container>
        <header className="catalog-page__header">
          <p className="text-label-caps text-secondary">Каталог</p>
          <h1>Пространство, собранное вокруг вас</h1>
          <p className="text-body-md text-secondary">
            Мебель и детали для отдыха, общения и повседневных ритуалов — спокойная основа дома, в
            котором всё на своём месте.
          </p>
        </header>
        <CatalogCategoryShowcase categories={catalog.categories} />
        <CatalogQueryGridView products={catalog.products} initialPageParam={initialPageParam} />
      </Container>
    </main>
  );
}
