import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/server/db";

export const publicStoreSettingsSelect = {
  name: true,
  description: true,
  contacts: true,
  socials: true,
} satisfies Prisma.StoreSettingsSelect;

export type PublicStoreSettingsRecord = Prisma.StoreSettingsGetPayload<{
  select: typeof publicStoreSettingsSelect;
}>;

type SettingsDatabase = Pick<PrismaClient, "storeSettings">;

export function findPrimaryPublicStoreSettings(
  database: SettingsDatabase = db,
): Promise<PublicStoreSettingsRecord | null> {
  return database.storeSettings.findUnique({
    where: { key: "primary" },
    select: publicStoreSettingsSelect,
  });
}
