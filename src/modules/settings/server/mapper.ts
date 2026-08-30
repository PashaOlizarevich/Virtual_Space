import "server-only";

import {
  publicStoreSettingsDtoSchema,
  type PublicStoreSettingsDto,
} from "@/modules/settings/server/dto";
import type { PublicStoreSettingsRecord } from "@/modules/settings/server/queries";

export function mapPublicStoreSettingsRecord(
  record: PublicStoreSettingsRecord,
): PublicStoreSettingsDto {
  return publicStoreSettingsDtoSchema.parse(record);
}
