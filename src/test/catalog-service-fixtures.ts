import type { ProductDto, ProductPreviewDto } from "@/modules/catalog/server/dto";
import type { CatalogPageResult } from "@/modules/catalog/server/service";
import type { Product } from "@/modules/catalog/types";
import { mapMoney, moneyToNumber } from "@/shared/money";

export function toProductPreviewDto(product: Product): ProductPreviewDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: mapMoney(moneyToNumber(product.price)),
    image: product.image,
    imageAlt: product.imageAlt,
    newFrom: product.newFrom ?? null,
    newUntil: product.newUntil ?? null,
  };
}

export function toProductDto(product: Product): ProductDto {
  return {
    ...toProductPreviewDto(product),
    gallery: product.gallery.map((image) => ({ ...image })),
    specifications: product.specifications.map((specification) => ({ ...specification })),
    optionGroups: product.optionGroups.map((group) => ({
      id: group.id,
      label: group.label,
      options: group.options.map((option) => ({ ...option })),
    })),
  };
}

export function catalogResult(products: readonly Product[]): CatalogPageResult {
  return { categories: [], products: products.map(toProductPreviewDto), nextCursor: null };
}
