import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { textilesDecorCategoryProducts } from "@/modules/catalog/mock-data";

export const metadata: Metadata = {
  title: "Текстиль и декор — Virtual Space",
  description: "Текстиль и декор из натуральных материалов для уютных и выразительных интерьеров.",
};

export default function TextilesDecorPage() {
  return (
    <main className="textiles-decor-page">
      <Container>
        <header className="textiles-decor-page__header">
          <p className="text-body-sm text-secondary">Каталог / Текстиль и декор</p>
          <h1>Текстиль и декор</h1>
          <p className="textiles-decor-page__description text-body-md text-secondary">
            Мягкие фактуры, природные материалы и выразительные детали создают атмосферу уюта и
            индивидуальности. Текстиль и декор легко адаптируются к интерьеру и помогают менять его
            настроение без лишних усилий.
          </p>
        </header>

        <section className="textiles-decor-page__collection" aria-labelledby="textiles-decor-title">
          <h2 id="textiles-decor-title">В коллекции</h2>
          <div className="textiles-decor-page__grid">
            {textilesDecorCategoryProducts.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
