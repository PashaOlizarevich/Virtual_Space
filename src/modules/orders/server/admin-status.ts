import "server-only";

import type { AdminOrderStatusUpdateInput } from "@/modules/orders/server/read-schemas";
import {
  updateOrderStatus,
  type AdminOrderStatusDto,
} from "@/modules/orders/server/order-status-update";
import { withAdminAuthorization } from "@/server/admin-auth";

export const updateAdminOrderStatus = withAdminAuthorization(
  (admin, input: AdminOrderStatusUpdateInput): Promise<AdminOrderStatusDto> =>
    updateOrderStatus(input, admin.id),
);
