import { z } from "zod";

import { publicStoreSettingsDtoSchema } from "@/modules/settings/server/dto";

export const adminStoreSettingsUpdateSchema = publicStoreSettingsDtoSchema;

export type AdminStoreSettingsUpdateInput = z.input<typeof adminStoreSettingsUpdateSchema>;
