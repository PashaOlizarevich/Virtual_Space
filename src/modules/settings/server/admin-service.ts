import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import {
  adminStoreSettingsUpdateSchema,
  type AdminStoreSettingsUpdateInput,
} from "@/modules/settings/server/admin-schemas";
import type { PublicStoreSettingsDto } from "@/modules/settings/server/dto";
import { mapPublicStoreSettingsRecord } from "@/modules/settings/server/mapper";
import { publicStoreSettingsSelect } from "@/modules/settings/server/queries";
import { db } from "@/server/db";

type SettingsDatabase = Pick<PrismaClient, "storeSettings">;

export class StoreSettingsNotFoundError extends Error {
  constructor() {
    super("Primary store settings were not found");
    this.name = "StoreSettingsNotFoundError";
  }
}

export async function getAdminStoreSettings(
  database: SettingsDatabase = db,
): Promise<PublicStoreSettingsDto> {
  const settings = await database.storeSettings.findUnique({
    where: { key: "primary" },
    select: publicStoreSettingsSelect,
  });

  if (!settings) throw new StoreSettingsNotFoundError();
  return mapPublicStoreSettingsRecord(settings);
}

export async function updateAdminStoreSettings(
  input: AdminStoreSettingsUpdateInput,
  database: SettingsDatabase = db,
): Promise<PublicStoreSettingsDto> {
  const settings = adminStoreSettingsUpdateSchema.parse(input);
  const updated = await database.storeSettings.update({
    where: { key: "primary" },
    data: {
      name: settings.name,
      description: settings.description,
      contacts: settings.contacts as Prisma.InputJsonValue,
      socials: settings.socials as Prisma.InputJsonValue,
    },
    select: publicStoreSettingsSelect,
  });

  return mapPublicStoreSettingsRecord(updated);
}
