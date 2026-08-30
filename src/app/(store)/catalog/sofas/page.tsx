import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Диваны — Virtual Space",
  description: "Диваны для отдыха, встреч с близкими и спокойных вечеров дома.",
};

export default async function SofasPage() {
  const { products } = await getPublicCatalog({ categorySlug: "sofas", pageSize: 100 });
  return (
    <main className="sofas-page">
      <Container>
        <header className="sofas-page__header">
          <p className="text-body-sm text-secondary">Каталог / Диваны</p>
          <h1>Диваны</h1>
          <p className="sofas-page__description text-body-md text-secondary">
            Диваны для долгих разговоров, тихих вечеров и неспешного отдыха — с продуманной
            посадкой, тактильными материалами и выразительными силуэтами.
          </p>
        </header>

        <section className="sofas-page__collection" aria-labelledby="sofas-title">
          <h2 id="sofas-title">В коллекции</h2>
          <div className="sofas-page__grid">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} imageQuality={100} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
