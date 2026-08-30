import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";

export const metadata: Metadata = {
  title: "Пуфики — Virtual Space",
  description:
    "Пуфики с выразительными формами и тактильными материалами для отдыха и уютных акцентов в интерьере.",
};

export default async function PoufsPage() {
  const { products } = await getPublicCatalog({ categorySlug: "poufs", pageSize: 100 });
  return (
    <main className="poufs-page">
      <Container>
        <header className="poufs-page__header">
          <p className="text-body-sm text-secondary">Каталог / Пуфики</p>
          <h1>Пуфики</h1>
          <p className="poufs-page__description text-body-md text-secondary">
            Пуфики добавляют интерьеру лёгкость и функциональность: становятся дополнительным местом
            для сидения, удобной подставкой для ног или выразительным акцентом. В коллекции собраны
            лаконичные формы, тактильные ткани и продуманные детали для ежедневного комфорта.
          </p>
        </header>

        <section className="poufs-page__collection" aria-labelledby="poufs-title">
          <h2 id="poufs-title">В коллекции</h2>
          <div className="poufs-page__grid">
            {products.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
