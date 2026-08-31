import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/server/db";

export const cartProductSelect = {
  id: true,
  name: true,
  price: true,
  currency: true,
  stock: true,
  isActive: true,
  optionGroups: {
    select: {
      key: true,
      label: true,
      options: {
        select: { key: true, label: true },
      },
    },
  },
} satisfies Prisma.ProductSelect;

export type CartProductRecord = Prisma.ProductGetPayload<{ select: typeof cartProductSelect }>;

type CartValidationDatabase = Pick<PrismaClient, "product">;

export function findCartProducts(
  productIds: readonly bigint[],
  database: CartValidationDatabase = db,
): Promise<CartProductRecord[]> {
  return database.product.findMany({
    where: { id: { in: [...productIds] } },
    select: cartProductSelect,
  });
}
