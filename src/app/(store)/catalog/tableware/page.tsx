import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Посуда — Virtual Space",
  description: "Посуда для ежедневной сервировки и тёплых домашних встреч.",
};

export default async function TablewarePage() {
  const { products } = await getPublicCatalog({ categorySlug: "tableware", pageSize: 100 });
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
          {products.map((product) => (
            <ProductPreview
              key={product.id}
              product={product}
              imageSizes="(max-width: 899px) 100vw, 60vw"
              imageQuality={100}
            />
          ))}
        </section>
      </Container>
    </main>
  );
}
