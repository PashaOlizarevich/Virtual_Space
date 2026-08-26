"use client";

import Link from "next/link";

import { FeedbackState } from "@/components/ui/feedback-state";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import type { Product } from "@/modules/catalog/types";
import { useFavoritesStore } from "@/modules/favorites/store";
import { useFavoritesHydrated } from "@/modules/favorites/use-favorites-hydrated";

type FavoritesGridProps = Readonly<{ products: readonly Product[] }>;

export function FavoritesGrid({ products }: FavoritesGridProps) {
  const hydrated = useFavoritesHydrated();
  const productIds = useFavoritesStore((state) => state.productIds);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const favoriteProducts = hydrated
    ? productIds.flatMap((productId) => {
        const product = productsById.get(productId);
        return product ? [product] : [];
      })
    : [];

  if (!favoriteProducts.length) {
    return (
      <FeedbackState
        className="favorites-page__empty"
        title="В избранном пока пусто"
        description="Здесь будут ваши избранные товары. Добавляйте их с помощью значка сердца в каталоге."
        action={
          <Link className="button button--primary button--default" href="/catalog">
            Перейти в каталог
          </Link>
        }
      />
    );
  }

  return (
    <section aria-labelledby="favorites-products-title">
      <h2 id="favorites-products-title" className="sr-only">
        Избранные товары
      </h2>
      <div className="favorites-page__grid">
        {favoriteProducts.map((product, index) => (
          <ProductPreview
            key={product.id}
            product={product}
            imageLoading={index === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
    </section>
  );
}
