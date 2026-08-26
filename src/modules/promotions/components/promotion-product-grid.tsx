import Link from "next/link";

import { FeedbackState } from "@/components/ui/feedback-state";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import type { PromotionalProduct } from "@/modules/promotions/types";

type PromotionProductGridProps = Readonly<{
  products: readonly PromotionalProduct[];
}>;

export function PromotionProductGrid({ products }: PromotionProductGridProps) {
  if (products.length === 0) {
    return (
      <FeedbackState
        className="sale-page__empty"
        title="Активных акций пока нет"
        description="Посмотрите полную коллекцию — новые предложения появятся здесь позже."
        action={
          <Link className="button button--primary button--default" href="/catalog">
            Перейти в каталог
          </Link>
        }
      />
    );
  }

  return (
    <section
      id="sale-products"
      className="promotion-products"
      aria-labelledby="sale-products-title"
    >
      <h2 id="sale-products-title">Предметы по специальной цене</h2>
      <div className="promotion-products__grid">
        {products.map((promotionalProduct) => (
          <ProductPreview
            key={promotionalProduct.product.id}
            product={promotionalProduct.product}
            imageSizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 33vw"
            pricing={promotionalProduct}
          />
        ))}
      </div>
    </section>
  );
}
