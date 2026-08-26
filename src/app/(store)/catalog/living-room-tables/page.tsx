import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { livingRoomTableCategoryProducts } from "@/modules/catalog/mock-data";

export const metadata: Metadata = {
  title: "Столы для гостиной — Virtual Space",
  description:
    "Журнальные и приставные столы из натурального дерева для уютной и функциональной гостиной.",
};

export default function LivingRoomTablesPage() {
  return (
    <main className="living-room-tables-page">
      <Container>
        <header className="living-room-tables-page__header">
          <p className="text-body-sm text-secondary">Каталог / Столы для гостиной</p>
          <h1>Столы для гостиной</h1>
          <p className="living-room-tables-page__description text-body-md text-secondary">
            Стол в гостиной объединяет зону отдыха и помогает держать нужные вещи рядом. В коллекции
            представлены журнальные и приставные модели из натурального дерева — компактные,
            выразительные и удобные для ежедневных сценариев.
          </p>
        </header>

        <section
          className="living-room-tables-page__collection"
          aria-labelledby="living-room-tables-title"
        >
          <h2 id="living-room-tables-title">В коллекции</h2>
          <div className="living-room-tables-page__grid">
            {livingRoomTableCategoryProducts.map((product) => (
              <ProductPreview key={product.id} product={product} imageLoading="eager" />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
