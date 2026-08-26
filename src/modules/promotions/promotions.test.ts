import { describe, expect, it } from "@jest/globals";

import type { Product } from "@/modules/catalog/types";
import {
  calculatePromotionalPrice,
  getActivePromotions,
  isPromotionActive,
} from "@/modules/promotions/promotions";
import type { Promotion } from "@/modules/promotions/types";

const product = {
  id: "chair",
  slug: "chair",
  name: "Кресло",
  description: "Описание",
  price: 199.9,
  currency: "BYN",
  image: "/chair.png",
  imageAlt: "Кресло",
  gallery: [],
  specifications: [],
  optionGroups: [],
} as const satisfies Product;

const promotion = {
  id: "primary",
  slug: "primary",
  title: "Акция",
  description: "Описание акции",
  startsAt: "2026-08-01T00:00:00.000Z",
  endsAt: "2026-08-31T23:59:59.999Z",
  productIds: [product.id],
  discountPercent: 20,
  featured: true,
} as const satisfies Promotion;

describe("promotions", () => {
  it("is inactive before the promotion period", () => {
    expect(isPromotionActive(promotion, new Date("2026-07-31T23:59:59.999Z"))).toBe(false);
  });

  it.each([promotion.startsAt, promotion.endsAt])("is active at the period boundary %s", (at) => {
    expect(isPromotionActive(promotion, new Date(at))).toBe(true);
  });

  it("is inactive after the promotion period", () => {
    expect(isPromotionActive(promotion, new Date("2026-09-01T00:00:00.000Z"))).toBe(false);
  });

  it("calculates and rounds a percentage price predictably", () => {
    expect(calculatePromotionalPrice(199.9, 20)).toBe(159.92);
  });

  it("safely ignores missing products", () => {
    expect(getActivePromotions([promotion], [], new Date(promotion.startsAt)).products).toEqual([]);
  });

  it("resolves conflicts deterministically by featured status, discount, start and id", () => {
    const competingPromotion = {
      ...promotion,
      id: "competing",
      featured: false,
      discountPercent: 40,
    } satisfies Promotion;

    const result = getActivePromotions(
      [competingPromotion, promotion],
      [product],
      new Date(promotion.startsAt),
    );

    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toMatchObject({ promotionId: promotion.id, discountPercent: 20 });
  });
});
