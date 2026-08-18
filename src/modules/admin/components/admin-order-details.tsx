import { Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  adminOrderStatusTransitions,
  type AdminOrder,
  type AdminOrderStatus,
} from "@/modules/admin/types";
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

type AdminOrderDetailsProps = Readonly<{
  order: AdminOrder;
  savingStatus?: AdminOrderStatus | null;
  statusError?: string;
  onStatusChange?: (status: AdminOrderStatus) => void;
}>;

export function AdminOrderDetails({
  order,
  savingStatus = null,
  statusError = "",
  onStatusChange,
}: AdminOrderDetailsProps) {
  const nextStatuses = adminOrderStatusTransitions[order.status];

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

      <section className="admin-order-status-control" aria-labelledby="admin-order-status-title">
        <div>
          <h3 id="admin-order-status-title">Изменить статус</h3>
          <p>
            {nextStatuses.length
              ? "Доступны только следующие шаги обработки заказа."
              : "Заказ находится в финальном статусе."}
          </p>
        </div>
        {nextStatuses.length && onStatusChange ? (
          <div className="admin-order-status-control__actions">
            {nextStatuses.map((status) => (
              <Button
                key={status}
                type="button"
                variant={status === "cancelled" ? "secondary" : "primary"}
                disabled={savingStatus !== null}
                aria-busy={savingStatus === status}
                onClick={() => onStatusChange(status)}
              >
                {savingStatus === status ? "Сохраняем…" : adminOrderStatusLabels[status]}
              </Button>
            ))}
          </div>
        ) : null}
        <p
          className="admin-order-status-control__feedback"
          aria-live="polite"
          role={statusError ? "alert" : undefined}
        >
          {statusError}
        </p>
      </section>

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
