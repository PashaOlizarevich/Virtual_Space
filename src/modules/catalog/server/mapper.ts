import "server-only";

import {
  catalogCursorDtoSchema,
  categoryDtoSchema,
  productDtoSchema,
  productPreviewDtoSchema,
  type CatalogCursorDto,
  type CategoryDto,
  type ProductDto,
  type ProductPreviewDto,
} from "@/modules/catalog/server/dto";
import type {
  CatalogCursor,
  CategoryRecord,
  ProductDetailRecord,
  ProductPreviewRecord,
} from "@/modules/catalog/server/queries";
import { mapMoney } from "@/shared/money";

export function mapCategoryRecord(record: CategoryRecord): CategoryDto {
  return categoryDtoSchema.parse(record);
}

export function mapProductPreviewRecord(record: ProductPreviewRecord): ProductPreviewDto {
  const primaryImage = record.images[0];

  return productPreviewDtoSchema.parse({
    id: record.id.toString(),
    slug: record.slug,
    name: record.name,
    description: record.description,
    price: mapMoney(record.price, record.currency),
    image: primaryImage?.secureUrl ?? "",
    imageAlt: primaryImage?.alt ?? "",
    newFrom: record.newFrom?.toISOString() ?? null,
    newUntil: record.newUntil?.toISOString() ?? null,
  });
}

export function mapProductDetailRecord(record: ProductDetailRecord): ProductDto {
  return productDtoSchema.parse({
    ...mapProductPreviewRecord(record),
    gallery: record.images.map((image) => ({ src: image.secureUrl, alt: image.alt })),
    specifications: record.specifications.map(({ label, value }) => ({ label, value })),
    optionGroups: record.optionGroups.map((group) => ({
      id: group.key,
      label: group.label,
      options: group.options.map((option) => ({ id: option.key, label: option.label })),
    })),
  });
}

export function mapCatalogCursor(cursor: CatalogCursor): CatalogCursorDto {
  return catalogCursorDtoSchema.parse({
    id: cursor.id.toString(),
    createdAt: cursor.createdAt.toISOString(),
  });
}
