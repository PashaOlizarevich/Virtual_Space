import "server-only";

import { findPrimaryPublicStoreSettings } from "@/modules/settings/server/queries";
import type { PublicStoreSettingsDto } from "@/modules/settings/server/dto";
import { mapPublicStoreSettingsRecord } from "@/modules/settings/server/mapper";

export async function getPublicStoreSettings(): Promise<PublicStoreSettingsDto | null> {
  const settings = await findPrimaryPublicStoreSettings();

  return settings ? mapPublicStoreSettingsRecord(settings) : null;
}
