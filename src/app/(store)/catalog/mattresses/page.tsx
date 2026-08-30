import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Матрасы — Virtual Space",
  description: "Матрасы для полноценного отдыха с точной поддержкой и продуманными материалами.",
};

export default async function MattressesPage() {
  const { products } = await getPublicCatalog({ categorySlug: "mattresses", pageSize: 100 });
  return (
    <main className="mattresses-page">
      <Container>
        <header className="mattresses-page__header">
          <p className="text-body-sm text-secondary">Каталог / Матрасы</p>
          <h1>Матрасы</h1>
          <p className="mattresses-page__description text-body-md text-secondary">
            Матрасы для полноценного отдыха и естественного восстановления. Продуманные слои,
            дышащие материалы и точная поддержка помогают телу расслабиться и сохраняют комфорт на
            протяжении всей ночи.
          </p>
        </header>

        <section className="mattresses-page__collection" aria-labelledby="mattresses-title">
          <h2 id="mattresses-title">В коллекции</h2>
          <div className="mattresses-page__grid">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
