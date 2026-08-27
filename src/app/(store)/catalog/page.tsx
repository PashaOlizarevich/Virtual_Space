import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CatalogCategoryShowcase } from "@/modules/catalog/components/catalog-category-showcase";
import { CatalogQueryGrid } from "@/modules/catalog/components/catalog-query-grid";

export const metadata: Metadata = { title: "Каталог — Virtual Space" };

export default function CatalogPage() {
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
        <CatalogCategoryShowcase />
        <CatalogQueryGrid />
      </Container>
    </main>
  );
}
