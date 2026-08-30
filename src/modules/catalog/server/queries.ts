import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/server/db";

export const categorySelect = {
  slug: true,
  name: true,
} satisfies Prisma.CategorySelect;

export const productPreviewSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  newFrom: true,
  newUntil: true,
  createdAt: true,
  images: {
    select: {
      secureUrl: true,
      alt: true,
    },
    orderBy: { position: "asc" },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export const productDetailSelect = {
  ...productPreviewSelect,
  images: {
    select: {
      secureUrl: true,
      alt: true,
    },
    orderBy: { position: "asc" },
  },
  specifications: {
    select: {
      label: true,
      value: true,
    },
    orderBy: { position: "asc" },
  },
  optionGroups: {
    select: {
      key: true,
      label: true,
      options: {
        select: {
          key: true,
          label: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ProductSelect;

export type CategoryRecord = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;
export type ProductPreviewRecord = Prisma.ProductGetPayload<{
  select: typeof productPreviewSelect;
}>;
export type ProductDetailRecord = Prisma.ProductGetPayload<{ select: typeof productDetailSelect }>;

export type CatalogCursor = Readonly<{
  id: bigint;
  createdAt: Date;
}>;

export type ProductPageQuery = Readonly<{
  categorySlug?: string;
  cursor?: CatalogCursor;
  take: number;
}>;

type CatalogDatabase = Pick<PrismaClient, "category" | "product">;

export function findPublicCategories(database: CatalogDatabase = db): Promise<CategoryRecord[]> {
  return database.category.findMany({
    select: categorySelect,
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export function findPublicProductPage(
  query: ProductPageQuery,
  database: CatalogDatabase = db,
): Promise<ProductPreviewRecord[]> {
  const cursorFilter = query.cursor
    ? {
        OR: [
          { createdAt: { lt: query.cursor.createdAt } },
          { createdAt: query.cursor.createdAt, id: { lt: query.cursor.id } },
        ],
      }
    : undefined;

  return database.product.findMany({
    where: {
      isActive: true,
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
      ...(cursorFilter ?? {}),
    },
    select: productPreviewSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.take,
  });
}

export function findPublicProductBySlug(
  slug: string,
  database: CatalogDatabase = db,
): Promise<ProductDetailRecord | null> {
  return database.product.findFirst({
    where: { slug, isActive: true },
    select: productDetailSelect,
  });
}
