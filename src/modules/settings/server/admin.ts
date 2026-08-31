import "server-only";

import type { AdminStoreSettingsUpdateInput } from "@/modules/settings/server/admin-schemas";
import * as service from "@/modules/settings/server/admin-service";
import { withAdminAuthorization } from "@/server/admin-auth";

export const getAdminStoreSettings = withAdminAuthorization(() => service.getAdminStoreSettings());

export const updateAdminStoreSettings = withAdminAuthorization(
  (_admin, input: AdminStoreSettingsUpdateInput) => service.updateAdminStoreSettings(input),
);
