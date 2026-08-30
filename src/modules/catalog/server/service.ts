import "server-only";

import { z } from "zod";

import type {
  CatalogCursorDto,
  CategoryDto,
  ProductDto,
  ProductPreviewDto,
} from "@/modules/catalog/server/dto";
import {
  mapCatalogCursor,
  mapCategoryRecord,
  mapProductDetailRecord,
  mapProductPreviewRecord,
} from "@/modules/catalog/server/mapper";
import {
  findPublicCategories,
  findPublicProductBySlug,
  findPublicProductPage,
  type CatalogCursor,
} from "@/modules/catalog/server/queries";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const pageSizeSchema = z.number().int().min(1).max(100);
const catalogCursorSchema = z.strictObject({
  id: z.bigint().positive(),
  createdAt: z.date().refine((value) => !Number.isNaN(value.getTime())),
});
const catalogPageInputSchema = z.strictObject({
  categorySlug: slugSchema.optional(),
  cursor: catalogCursorSchema.optional(),
  pageSize: pageSizeSchema.optional(),
});

export type CatalogPageInput = Readonly<{
  categorySlug?: string;
  cursor?: CatalogCursor;
  pageSize?: number;
}>;

export type CatalogPageResult = Readonly<{
  categories: readonly CategoryDto[];
  products: readonly ProductPreviewDto[];
  nextCursor: CatalogCursorDto | null;
}>;

export async function getPublicCategories(): Promise<readonly CategoryDto[]> {
  return (await findPublicCategories()).map(mapCategoryRecord);
}

export async function getPublicCatalog(input: CatalogPageInput = {}): Promise<CatalogPageResult> {
  const parsedInput = catalogPageInputSchema.parse(input);
  const pageSize = parsedInput.pageSize ?? 24;

  const [categories, productsWithLookahead] = await Promise.all([
    findPublicCategories(),
    findPublicProductPage({
      categorySlug: parsedInput.categorySlug,
      cursor: parsedInput.cursor,
      take: pageSize + 1,
    }),
  ]);
  const products = productsWithLookahead.slice(0, pageSize);
  const lastProduct = products.at(-1);

  return {
    categories: categories.map(mapCategoryRecord),
    products: products.map(mapProductPreviewRecord),
    nextCursor:
      productsWithLookahead.length > pageSize && lastProduct
        ? mapCatalogCursor({ id: lastProduct.id, createdAt: lastProduct.createdAt })
        : null,
  };
}

export async function getPublicProductBySlug(slug: string): Promise<ProductDto | null> {
  const product = await findPublicProductBySlug(slugSchema.parse(slug));

  return product ? mapProductDetailRecord(product) : null;
}
