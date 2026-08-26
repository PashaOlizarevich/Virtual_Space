import type { Product } from "@/modules/catalog/types";
import type { ActivePromotions, Promotion, PromotionalProduct } from "@/modules/promotions/types";

function parseTimestamp(value: string): number | undefined {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function isValidDiscount(discountPercent: number): boolean {
  return Number.isFinite(discountPercent) && discountPercent > 0 && discountPercent < 100;
}

export function isPromotionActive(promotion: Promotion, at: Date): boolean {
  const startsAt = parseTimestamp(promotion.startsAt);
  const endsAt = parseTimestamp(promotion.endsAt);
  const timestamp = at.getTime();

  return (
    startsAt !== undefined &&
    endsAt !== undefined &&
    !Number.isNaN(timestamp) &&
    startsAt <= endsAt &&
    timestamp >= startsAt &&
    timestamp <= endsAt
  );
}

export function calculatePromotionalPrice(price: number, discountPercent: number): number {
  if (!Number.isFinite(price) || price < 0 || !isValidDiscount(discountPercent)) return price;

  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

function comparePromotionPriority(left: Promotion, right: Promotion): number {
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  if (left.discountPercent !== right.discountPercent) {
    return right.discountPercent - left.discountPercent;
  }

  const startDifference = Date.parse(left.startsAt) - Date.parse(right.startsAt);
  if (startDifference !== 0) return startDifference;

  return left.id.localeCompare(right.id);
}

export function getActivePromotions(
  allPromotions: readonly Promotion[],
  products: readonly Product[],
  at: Date,
): ActivePromotions {
  const activePromotions = allPromotions
    .filter((promotion) => isValidDiscount(promotion.discountPercent))
    .filter((promotion) => isPromotionActive(promotion, at))
    .toSorted(comparePromotionPriority);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const assignedProductIds = new Set<string>();
  const promotionalProducts: PromotionalProduct[] = [];

  for (const promotion of activePromotions) {
    for (const productId of promotion.productIds) {
      if (assignedProductIds.has(productId)) continue;

      const product = productsById.get(productId);
      if (!product) continue;

      assignedProductIds.add(productId);
      promotionalProducts.push({
        product,
        originalPrice: product.price,
        currentPrice: calculatePromotionalPrice(product.price, promotion.discountPercent),
        discountPercent: promotion.discountPercent,
        promotionId: promotion.id,
      });
    }
  }

  return {
    promotions: activePromotions,
    featuredPromotion: activePromotions.find((promotion) => promotion.featured),
    products: promotionalProducts,
  };
}
