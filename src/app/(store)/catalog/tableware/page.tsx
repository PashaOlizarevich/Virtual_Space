import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { lumoTablewareProduct } from "@/modules/catalog/mock-data";

export const metadata: Metadata = {
  title: "Посуда — Virtual Space",
  description: "Посуда для ежедневной сервировки и тёплых домашних встреч.",
};

export default function TablewarePage() {
  return (
    <main className="tableware-page">
      <Container>
        <header className="tableware-page__header">
          <p className="text-body-sm text-secondary">Каталог / Посуда</p>
          <h1>Посуда</h1>
          <p className="tableware-page__description text-body-md text-secondary">
            Коллекция посуды для неспешных завтраков, семейных ужинов и красивой сервировки каждый
            день.
          </p>
        </header>

        <section className="tableware-page__collection" aria-labelledby="tableware-title">
          <h2 id="tableware-title">В коллекции</h2>
          <ProductPreview product={lumoTablewareProduct} />
        </section>
      </Container>
    </main>
  );
}
