import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { armchairCategoryProducts } from "@/modules/catalog/mock-data";

export const metadata: Metadata = {
  title: "Кресла — Virtual Space",
  description:
    "Кресла для чтения, отдыха и выразительных интерьерных акцентов с продуманной посадкой и тактильными материалами.",
};

export default function ArmchairsPage() {
  return (
    <main className="armchairs-page">
      <Container>
        <header className="armchairs-page__header">
          <p className="text-body-sm text-secondary">Каталог / Кресла</p>
          <h1>Кресла</h1>
          <p className="armchairs-page__description text-body-md text-secondary">
            Кресло создаёт личное пространство для чтения, спокойного отдыха и восстановления. В
            коллекции собраны модели с продуманной поддержкой, выразительными силуэтами и
            тактильными тканями — от компактных поворотных форм до глубоких кресел для долгих
            вечеров.
          </p>
        </header>

        <section className="armchairs-page__collection" aria-labelledby="armchairs-title">
          <h2 id="armchairs-title">В коллекции</h2>
          <div className="armchairs-page__grid">
            {armchairCategoryProducts.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
