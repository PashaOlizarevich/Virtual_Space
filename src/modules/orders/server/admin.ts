import "server-only";

import type { AdminOrderListInput } from "@/modules/orders/server/read-schemas";
import * as service from "@/modules/orders/server/order-read";
import { withAdminAuthorization } from "@/server/admin-auth";

export const getAdminOrders = withAdminAuthorization((_admin, input: AdminOrderListInput) =>
  service.listAdminOrders(input),
);
