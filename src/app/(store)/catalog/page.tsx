import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CatalogQueryGrid } from "@/modules/catalog/components/catalog-query-grid";

export const metadata: Metadata = { title: "Каталог — Virtual Space" };

export default function CatalogPage() {
  return (
    <main className="catalog-page">
      <Container>
        <header className="catalog-page__header">
          <p className="text-label-caps text-secondary">Каталог</p>
          <h1>Мебель для спокойного дома</h1>
          <p className="text-body-md text-secondary">
            Предметы с ясной формой, натуральными материалами и вниманием к ежедневному комфорту.
          </p>
        </header>
        <CatalogQueryGrid />
      </Container>
    </main>
  );
}
