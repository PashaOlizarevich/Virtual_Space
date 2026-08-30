import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Кровати — Virtual Space",
  description: "Кровати для спокойного сна с продуманными конструкциями и тактильными материалами.",
};

export default async function BedsPage() {
  const { products } = await getPublicCatalog({ categorySlug: "beds", pageSize: 100 });
  return (
    <main className="beds-page">
      <Container>
        <header className="beds-page__header">
          <p className="text-body-sm text-secondary">Каталог / Кровати</p>
          <h1>Кровати</h1>
          <p className="beds-page__description text-body-md text-secondary">
            Кровати, созданные для глубокого и спокойного сна. Тактильные материалы, надёжные
            основания и продуманные пропорции помогают сделать спальню по-настоящему комфортной.
          </p>
        </header>

        <section className="beds-page__collection" aria-labelledby="beds-title">
          <h2 id="beds-title">В коллекции</h2>
          <div className="beds-page__grid">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
