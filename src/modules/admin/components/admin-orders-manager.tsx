"use client";

import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminOrderDetails,
  formatAdminOrderDate,
  formatAdminOrderMoney,
} from "@/modules/admin/components/admin-order-details";
import { AdminShell } from "@/modules/admin/components/admin-shell";
import { getAdminOrders, updateAdminOrderStatus } from "@/modules/admin/orders-transport";
import type { AdminOrder, AdminOrderStatus } from "@/modules/admin/types";

export function AdminOrdersManager({ initialOrders = [] }: { initialOrders?: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(initialOrders[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState<AdminOrderStatus | null>(null);
  const [statusError, setStatusError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminOrders();
      setOrders(result);
      setSelectedId((current) => current ?? result[0]?.id ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Не удалось загрузить список заказов.",
      );
    } finally {
      setLoading(false);
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  const visibleOrders = orders.filter((order) =>
    `${order.id} ${order.customer.name} ${order.customer.email} ${order.customer.phone}`
      .toLocaleLowerCase("ru")
      .includes(normalizedQuery),
  );
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null;

  async function changeSelectedOrderStatus(status: AdminOrderStatus) {
    if (!selectedOrder || savingStatus) return;

    setSavingStatus(status);
    setStatusError("");
    try {
      const updatedOrder = await updateAdminOrderStatus({
        orderId: selectedOrder.id,
        status,
      });
      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.orderNumber ? { ...order, status: updatedOrder.status } : order,
        ),
      );
    } catch (saveError) {
      setStatusError(
        saveError instanceof Error ? saveError.message : "Не удалось изменить статус заказа.",
      );
    } finally {
      setSavingStatus(null);
    }
  }

  return (
    <AdminShell active="orders">
      <main className="admin-dashboard admin-orders">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Продажи</p>
            <h1>Заказы</h1>
            <p>Просматривайте новые заявки, покупателей и состав каждого заказа.</p>
          </div>
          <span className="admin-dashboard__preview">Данные PostgreSQL</span>
        </header>

        <div className="admin-products__toolbar">
          <label htmlFor="admin-order-search" className="sr-only">
            Поиск заказов
          </label>
          <div className="admin-products__search">
            <Search aria-hidden="true" />
            <Input
              id="admin-order-search"
              type="search"
              placeholder="Номер, имя, телефон или email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p>{visibleOrders.length} заказов</p>
        </div>

        {error ? (
          <section className="admin-products__state" role="alert">
            <h2>Не удалось загрузить заказы</h2>
            <p>{error}</p>
            <Button variant="secondary" onClick={() => void loadOrders()}>
              Повторить
            </Button>
          </section>
        ) : null}
        {loading ? (
          <section className="admin-products__state" aria-busy="true" aria-live="polite">
            <p>Загружаем заказы…</p>
          </section>
        ) : null}
        {!loading && !error && visibleOrders.length === 0 ? (
          <section className="admin-products__state">
            <h2>{orders.length ? "Ничего не найдено" : "Заказов пока нет"}</h2>
            <p>{orders.length ? "Измените поисковый запрос." : "Новые заявки появятся здесь."}</p>
          </section>
        ) : null}
        {!loading && !error && visibleOrders.length ? (
          <div className="admin-orders__workspace">
            <section className="admin-orders__list" aria-labelledby="admin-orders-list-title">
              <h2 className="sr-only" id="admin-orders-list-title">
                Список заказов
              </h2>
              <ul>
                {visibleOrders.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="admin-order-row"
                      aria-pressed={selectedId === order.id}
                      onClick={() => setSelectedId(order.id)}
                    >
                      <span>
                        <strong>{order.id}</strong>
                        <time dateTime={order.createdAt}>
                          {formatAdminOrderDate(order.createdAt)}
                        </time>
                      </span>
                      <span>{order.customer.name}</span>
                      <span>
                        <ShoppingBag aria-hidden="true" />
                        {order.items.reduce((total, item) => total + item.quantity, 0)} шт.
                      </span>
                      <strong>{formatAdminOrderMoney(order.total)}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            {selectedOrder ? (
              <AdminOrderDetails
                order={selectedOrder}
                savingStatus={savingStatus}
                statusError={statusError}
                onStatusChange={(status) => void changeSelectedOrderStatus(status)}
              />
            ) : null}
          </div>
        ) : null}
      </main>
    </AdminShell>
  );
}
