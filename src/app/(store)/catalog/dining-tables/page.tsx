import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { diningTableCategoryProducts } from "@/modules/catalog/mock-data";

export const metadata: Metadata = {
  title: "Столы обеденные — Virtual Space",
  description: "Обеденные столы из натурального дерева для семейных ужинов и встреч с близкими.",
};

export default function DiningTablesPage() {
  return (
    <main className="dining-tables-page">
      <Container>
        <header className="dining-tables-page__header">
          <p className="text-body-sm text-secondary">Каталог / Столы обеденные</p>
          <h1>Столы обеденные</h1>
          <p className="dining-tables-page__description text-body-md text-secondary">
            Обеденный стол становится центром дома — местом для неспешных завтраков, семейных ужинов
            и встреч с близкими. В коллекции собраны выразительные формы из натурального дерева,
            рассчитанные на ежедневные ритуалы и долгую службу.
          </p>
        </header>

        <section className="dining-tables-page__collection" aria-labelledby="dining-tables-title">
          <h2 id="dining-tables-title">В коллекции</h2>
          <div className="dining-tables-page__grid">
            {diningTableCategoryProducts.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
