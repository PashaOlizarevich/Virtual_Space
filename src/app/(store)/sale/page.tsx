import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { allProducts } from "@/modules/catalog/mock-data";
import { PromotionHero } from "@/modules/promotions/components/promotion-hero";
import { PromotionProductGrid } from "@/modules/promotions/components/promotion-product-grid";
import { promotions } from "@/modules/promotions/mock-data";
import { getActivePromotions } from "@/modules/promotions/promotions";

export const metadata: Metadata = {
  title: "Акции на мебель и декор — Virtual Space",
  description: "Действующие акции Virtual Space и предметы мебели по специальным ценам.",
};

export const dynamic = "force-dynamic";

export default function SalePage() {
  const activePromotions = getActivePromotions(promotions, allProducts, new Date());
  const featuredProduct = activePromotions.products.find(
    ({ promotionId }) => promotionId === activePromotions.featuredPromotion?.id,
  )?.product;

  return (
    <main className="sale-page">
      <Container>
        {activePromotions.featuredPromotion && featuredProduct ? (
          <PromotionHero
            promotion={activePromotions.featuredPromotion}
            featuredProduct={featuredProduct}
          />
        ) : null}
        <PromotionProductGrid products={activePromotions.products} />
      </Container>
    </main>
  );
}
