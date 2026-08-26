import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { allProducts } from "@/modules/catalog/mock-data";
import { FavoritesGrid } from "@/modules/favorites/components/favorites-grid";

export const metadata: Metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return (
    <main className="favorites-page">
      <Container>
        <header className="favorites-page__header">
          <p className="text-label-caps text-secondary">Ваш выбор</p>
          <h1>Избранное</h1>
          <p className="text-body-md text-secondary">
            Сохраняйте понравившиеся предметы, чтобы вернуться к ним позже.
          </p>
        </header>
        <FavoritesGrid products={allProducts} />
      </Container>
    </main>
  );
}
