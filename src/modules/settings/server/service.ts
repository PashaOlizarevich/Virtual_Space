import "server-only";

import {
  findPrimaryPublicStoreSettings,
  type PublicStoreSettingsRecord,
} from "@/modules/settings/server/queries";

export async function getPublicStoreSettings(): Promise<PublicStoreSettingsRecord | null> {
  return findPrimaryPublicStoreSettings();
}
