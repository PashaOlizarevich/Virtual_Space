import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { FeedbackState } from "@/components/ui/feedback-state";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { allProducts } from "@/modules/catalog/mock-data";
import { getActiveNewArrivals } from "@/modules/catalog/new-arrivals";
import type { Product } from "@/modules/catalog/types";

export const metadata: Metadata = {
  title: "Новинки — Virtual Space",
  description: "Новые предметы мебели и декора Virtual Space, недавно появившиеся в коллекции.",
};

export const dynamic = "force-dynamic";

type NewArrivalsViewProps = Readonly<{ products: readonly Product[] }>;

export function NewArrivalsView({ products }: NewArrivalsViewProps) {
  return (
    <main className="catalog-page new-arrivals-page">
      <Container>
        <header className="catalog-page__header">
          <p className="text-label-caps text-secondary">Новинки</p>
          <h1>Новые предметы для дома</h1>
          <p className="text-body-md text-secondary">
            Свежие модели мебели и декора, которые недавно пополнили коллекцию Virtual Space.
          </p>
        </header>

        {products.length > 0 ? (
          <section aria-labelledby="new-arrivals-title">
            <h2 id="new-arrivals-title" className="sr-only">
              Активные новинки
            </h2>
            <div className="catalog-page__grid">
              {products.map((product) => (
                <ProductPreview
                  key={product.id}
                  product={product}
                  imageLoading="eager"
                  showNewBadge
                />
              ))}
            </div>
          </section>
        ) : (
          <FeedbackState
            title="Новых поступлений пока нет"
            description="Загляните в полный каталог — там собрана вся доступная коллекция."
            action={
              <Link className="button button--primary button--default" href="/catalog">
                Перейти в каталог
              </Link>
            }
          />
        )}
      </Container>
    </main>
  );
}

export default function NewArrivalsPage() {
  return <NewArrivalsView products={getActiveNewArrivals(allProducts)} />;
}
