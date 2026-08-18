import { Mail, Phone } from "lucide-react";

import type { AdminOrder, AdminOrderStatus } from "@/modules/admin/types";
import { cn } from "@/shared/utils";

export const adminOrderStatusLabels: Record<AdminOrderStatus, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  "in-progress": "В обработке",
  completed: "Завершён",
  cancelled: "Отменён",
};

export function formatAdminOrderMoney(value: number) {
  return new Intl.NumberFormat("ru-BY", {
    style: "currency",
    currency: "BYN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAdminOrderDate(value: string) {
  return new Intl.DateTimeFormat("ru-BY", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function AdminOrderDetails({ order }: Readonly<{ order: AdminOrder }>) {
  return (
    <article className="admin-order-details" aria-labelledby="admin-order-details-title">
      <header className="admin-order-details__header">
        <div>
          <p className="text-label-caps text-secondary">Детали заказа</p>
          <h2 id="admin-order-details-title">{order.id}</h2>
          <time dateTime={order.createdAt}>{formatAdminOrderDate(order.createdAt)}</time>
        </div>
        <span className={cn("admin-order-status", `admin-order-status--${order.status}`)}>
          {adminOrderStatusLabels[order.status]}
        </span>
      </header>

      <section className="admin-order-customer" aria-labelledby="admin-order-customer-title">
        <h3 id="admin-order-customer-title">Покупатель</h3>
        <strong>{order.customer.name}</strong>
        <a href={`tel:${order.customer.phone.replace(/[^+\d]/g, "")}`}>
          <Phone aria-hidden="true" />
          {order.customer.phone}
        </a>
        <a href={`mailto:${order.customer.email}`}>
          <Mail aria-hidden="true" />
          {order.customer.email}
        </a>
        {order.customer.comment ? <p>{order.customer.comment}</p> : null}
      </section>

      <section className="admin-order-composition" aria-labelledby="admin-order-composition-title">
        <h3 id="admin-order-composition-title">Состав заказа</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.configuration}</span>
              </div>
              <span>{item.quantity} шт.</span>
              <span>{formatAdminOrderMoney(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="admin-order-total">
          <span>Итого</span>
          <strong>{formatAdminOrderMoney(order.total)}</strong>
        </div>
      </section>
    </article>
  );
}
