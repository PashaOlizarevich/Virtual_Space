import "server-only";

import type { OrderStatus, Prisma, PrismaClient } from "@prisma/client";

import {
  adminOrderListSchema,
  orderLookupSchema,
  type AdminOrderListInput,
  type OrderLookupInput,
} from "@/modules/orders/server/read-schemas";
import { db } from "@/server/db";
import { mapMoney, type MoneyDto } from "@/shared/money";

const orderItemSelect = {
  id: true,
  snapshotName: true,
  snapshotOptions: true,
  snapshotPrice: true,
  quantity: true,
  lineTotal: true,
} satisfies Prisma.OrderItemSelect;

const customerOrderSelect = {
  publicNumber: true,
  status: true,
  currency: true,
  total: true,
  createdAt: true,
  updatedAt: true,
  items: { select: orderItemSelect, orderBy: { id: "asc" } },
} satisfies Prisma.OrderSelect;

const adminOrderSelect = {
  ...customerOrderSelect,
  customerName: true,
  email: true,
  phone: true,
  comment: true,
} satisfies Prisma.OrderSelect;

type CustomerOrderRecord = Prisma.OrderGetPayload<{ select: typeof customerOrderSelect }>;
type AdminOrderRecord = Prisma.OrderGetPayload<{ select: typeof adminOrderSelect }>;
type OrderReadDatabase = Pick<PrismaClient, "order">;

export type OrderItemDto = Readonly<{
  id: string;
  name: string;
  selectedOptions: readonly Readonly<{ groupId: string; optionId: string }>[];
  unitPrice: MoneyDto;
  quantity: number;
  lineTotal: MoneyDto;
}>;

export type CustomerOrderDto = Readonly<{
  orderNumber: string;
  status: OrderStatus;
  total: MoneyDto;
  createdAt: string;
  updatedAt: string;
  items: readonly OrderItemDto[];
}>;

export type AdminOrderDto = CustomerOrderDto &
  Readonly<{
    customer: Readonly<{
      name: string;
      email: string;
      phone: string;
      comment: string | null;
    }>;
  }>;

export type AdminOrderPageDto = Readonly<{
  orders: readonly AdminOrderDto[];
  nextCursor: string | null;
}>;

export class OrderNotFoundError extends Error {
  constructor() {
    super("Order not found");
    this.name = "OrderNotFoundError";
  }
}

function mapSelectedOptions(value: Prisma.JsonValue): OrderItemDto["selectedOptions"] {
  if (!Array.isArray(value)) throw new Error("Invalid stored order options");

  return value.map((option) => {
    if (
      typeof option !== "object" ||
      option === null ||
      Array.isArray(option) ||
      typeof option.groupId !== "string" ||
      typeof option.optionId !== "string"
    ) {
      throw new Error("Invalid stored order options");
    }

    return { groupId: option.groupId, optionId: option.optionId };
  });
}

function mapOrderItem(
  item: CustomerOrderRecord["items"][number],
  currency: CustomerOrderRecord["currency"],
): OrderItemDto {
  return {
    id: item.id.toString(),
    name: item.snapshotName,
    selectedOptions: mapSelectedOptions(item.snapshotOptions),
    unitPrice: mapMoney(item.snapshotPrice, currency),
    quantity: item.quantity,
    lineTotal: mapMoney(item.lineTotal, currency),
  };
}

function mapCustomerOrder(order: CustomerOrderRecord): CustomerOrderDto {
  return {
    orderNumber: order.publicNumber,
    status: order.status,
    total: mapMoney(order.total, order.currency),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => mapOrderItem(item, order.currency)),
  };
}

function mapAdminOrder(order: AdminOrderRecord): AdminOrderDto {
  return {
    ...mapCustomerOrder(order),
    customer: {
      name: order.customerName,
      email: order.email,
      phone: order.phone,
      comment: order.comment,
    },
  };
}

export async function getCustomerOrder(
  input: OrderLookupInput,
  authenticatedUserId: string | null,
  database: OrderReadDatabase = db,
): Promise<CustomerOrderDto> {
  const lookup = orderLookupSchema.parse(input);
  const ownership = [
    ...(authenticatedUserId ? [{ userId: authenticatedUserId }] : []),
    ...(lookup.email
      ? [{ userId: null, email: { equals: lookup.email, mode: "insensitive" as const } }]
      : []),
  ];

  if (ownership.length === 0) throw new OrderNotFoundError();

  const order = await database.order.findFirst({
    where: { publicNumber: lookup.orderNumber, OR: ownership },
    select: customerOrderSelect,
  });

  if (!order) throw new OrderNotFoundError();
  return mapCustomerOrder(order);
}

export async function listAdminOrders(
  input: AdminOrderListInput,
  database: OrderReadDatabase = db,
): Promise<AdminOrderPageDto> {
  const { cursor, limit } = adminOrderListSchema.parse(input);
  const orders = await database.order.findMany({
    ...(cursor ? { cursor: { publicNumber: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    select: adminOrderSelect,
  });
  const hasNextPage = orders.length > limit;
  const page = hasNextPage ? orders.slice(0, limit) : orders;

  return {
    orders: page.map(mapAdminOrder),
    nextCursor: hasNextPage ? (page.at(-1)?.publicNumber ?? null) : null,
  };
}
