"use client";

import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { FeedbackState, LoadingState, RetryButton } from "@/components/ui/feedback-state";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { catalogQueryOptions } from "@/modules/catalog/queries";
import type { Product } from "@/modules/catalog/types";

type CatalogQueryGridViewProps = Readonly<{
  products?: readonly Product[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}>;

export function CatalogQueryGridView({
  products,
  isLoading = false,
  isFetching = false,
  error = null,
  onRefresh = () => undefined,
}: CatalogQueryGridViewProps) {
  if (isLoading) {
    return (
      <div className="catalog-query-state catalog-page__grid" aria-label="Загрузка каталога">
        {Array.from({ length: 4 }, (_, index) => (
          <LoadingState key={index} label={`Загрузка товара ${index + 1}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <FeedbackState
        kind="error"
        title="Не удалось загрузить каталог"
        description="Проверьте подключение и попробуйте обновить данные."
        action={<RetryButton onRetry={onRefresh} />}
      />
    );
  }

  if (!products?.length) {
    return (
      <FeedbackState
        title="Каталог пока пуст"
        description="Новые предметы появятся здесь после обновления коллекции."
        action={<RetryButton onRetry={onRefresh} />}
      />
    );
  }

  return (
    <section className="catalog-query" aria-labelledby="catalog-results-title">
      <div className="catalog-query__toolbar">
        <h2 id="catalog-results-title" className="sr-only">
          Товары каталога
        </h2>
        <p className="text-body-sm text-secondary" aria-live="polite">
          {isFetching ? "Обновляем коллекцию…" : `В коллекции: ${products.length}`}
        </p>
        <Button variant="ghost" onClick={onRefresh} disabled={isFetching}>
          <RefreshCw aria-hidden="true" size={18} />
          Обновить
        </Button>
      </div>
      <div className="catalog-page__grid">
        {products.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function CatalogQueryGrid() {
  const query = useQuery(catalogQueryOptions());

  return (
    <CatalogQueryGridView
      products={query.data}
      isLoading={query.isPending}
      isFetching={query.isFetching}
      error={query.error}
      onRefresh={() => void query.refetch()}
    />
  );
}
