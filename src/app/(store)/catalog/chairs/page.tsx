import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Стулья — Virtual Space",
  description: "Стулья для обеденной зоны, рабочего места и спокойных домашних пауз.",
};

export default async function ChairsPage() {
  const { products } = await getPublicCatalog({ categorySlug: "chairs", pageSize: 100 });
  return (
    <main className="chairs-page">
      <Container>
        <header className="chairs-page__header">
          <p className="text-body-sm text-secondary">Каталог / Стулья</p>
          <h1>Стулья</h1>
          <p className="chairs-page__description text-body-md text-secondary">
            Стулья для обеденной зоны, рабочего места и тихих домашних пауз — с выверенной посадкой
            и честными материалами.
          </p>
        </header>

        <section className="chairs-page__collection" aria-labelledby="chairs-title">
          <h2 id="chairs-title">В коллекции</h2>
          <div className="chairs-page__grid">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} imageQuality={100} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
