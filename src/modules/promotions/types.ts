import type { Product } from "@/modules/catalog/types";

export type Promotion = Readonly<{
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  productIds: readonly string[];
  discountPercent: number;
  featured: boolean;
}>;

export type PromotionalProduct = Readonly<{
  product: Product;
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  promotionId: string;
}>;

export type ActivePromotions = Readonly<{
  promotions: readonly Promotion[];
  featuredPromotion?: Promotion;
  products: readonly PromotionalProduct[];
}>;
