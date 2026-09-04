import { z } from "zod";

import type { AdminOrder, AdminOrderStatus } from "@/modules/admin/types";
import { moneyDtoSchema, moneyToNumber } from "@/shared/money";

const serverStatusSchema = z.enum(["NEW", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const selectedOptionSchema = z.strictObject({
  groupId: z.string(),
  groupLabel: z.string(),
  optionId: z.string(),
  optionLabel: z.string(),
});
const serverOrderSchema = z.strictObject({
  orderNumber: z.string(),
  status: serverStatusSchema,
  total: moneyDtoSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  customer: z.strictObject({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    comment: z.string().nullable(),
  }),
  items: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
      selectedOptions: z.array(selectedOptionSchema),
      unitPrice: moneyDtoSchema,
      quantity: z.number().int().positive(),
      lineTotal: moneyDtoSchema,
    }),
  ),
});
const serverOrderPageSchema = z.strictObject({
  orders: z.array(serverOrderSchema),
  nextCursor: z.string().nullable(),
});
const statusResultSchema = z.strictObject({
  orderNumber: z.string(),
  status: serverStatusSchema,
  updatedAt: z.iso.datetime(),
});

const serverToClientStatus = {
  NEW: "new",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const satisfies Record<z.infer<typeof serverStatusSchema>, AdminOrderStatus>;

const clientToServerStatus = {
  new: "NEW",
  confirmed: "CONFIRMED",
  "in-progress": "IN_PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
} as const satisfies Record<AdminOrderStatus, z.infer<typeof serverStatusSchema>>;

function mapServerOrder(order: z.infer<typeof serverOrderSchema>): AdminOrder {
  return {
    id: order.orderNumber,
    createdAt: order.createdAt,
    status: serverToClientStatus[order.status],
    customer: { ...order.customer, comment: order.customer.comment ?? undefined },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      configuration:
        item.selectedOptions.map(({ optionLabel }) => optionLabel).join(", ") || "Без опций",
      quantity: item.quantity,
      unitPrice: moneyToNumber(item.unitPrice),
    })),
    total: moneyToNumber(order.total),
  };
}

async function getPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export function mapAdminOrderPage(input: unknown): AdminOrder[] {
  return serverOrderPageSchema.parse(input).orders.map(mapServerOrder);
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const response = await fetch("/api/admin/orders?limit=50", { cache: "no-store" });
  const payload = await getPayload(response);
  if (!response.ok) throw new Error("Не удалось загрузить список заказов.");
  return mapAdminOrderPage(payload);
}

export async function updateAdminOrderStatus(input: {
  orderId: string;
  status: AdminOrderStatus;
}): Promise<{ orderNumber: string; status: AdminOrderStatus }> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(input.orderId)}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: clientToServerStatus[input.status] }),
  });
  const payload = await getPayload(response);
  if (response.status === 409) {
    throw new Error("Статус уже изменился или переход больше недоступен. Обновите список.");
  }
  if (!response.ok) throw new Error("Не удалось изменить статус заказа.");
  const result = statusResultSchema.parse(payload);
  return { orderNumber: result.orderNumber, status: serverToClientStatus[result.status] };
}
