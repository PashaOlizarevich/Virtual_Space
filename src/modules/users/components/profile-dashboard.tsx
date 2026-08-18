"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, PackageCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/modules/cart/store";
import { validateCartItem } from "@/modules/cart/validation";
import { updateProfilePreview } from "@/modules/users/mock-transport";
import { profileDetailsSchema, type ProfileDetailsValues } from "@/modules/users/schemas";
import type { ProfileDetails, ProfileOrder, OrderStatus } from "@/modules/users/types";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ru-BY", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const statusLabels: Record<OrderStatus, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  "in-progress": "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
};

function ProfileForm({ profile }: Readonly<{ profile: ProfileDetails }>) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProfileDetailsValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: profile,
  });

  return (
    <section className="profile-card profile-card--details" aria-labelledby="profile-details-title">
      <header className="profile-card__header">
        <p className="text-label-caps text-secondary">Личные данные</p>
        <h2 id="profile-details-title">Контактная информация</h2>
        <p>Используем эти данные, чтобы связаться с вами по заказу.</p>
      </header>
      <form
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          setError(null);
          setStatus(null);
          try {
            await updateProfilePreview(values);
            setStatus(
              "Данные проверены. Сохранение на сервере будет доступно после подключения Auth.js.",
            );
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Не удалось обновить профиль.");
          }
        })}
      >
        <FieldGroup>
          {(
            [
              ["name", "Имя", "name"],
              ["email", "Email", "email"],
              ["phone", "Телефон", "tel"],
            ] as const
          ).map(([name, label, autoComplete]) => {
            const fieldError = form.formState.errors[name]?.message;
            return (
              <Field key={name} data-invalid={Boolean(fieldError) || undefined}>
                <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
                <Input
                  id={`profile-${name}`}
                  type={name === "email" ? "email" : "text"}
                  inputMode={name === "phone" ? "tel" : name === "email" ? "email" : undefined}
                  autoComplete={autoComplete}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? `profile-${name}-error` : undefined}
                  {...form.register(name)}
                />
                {fieldError ? (
                  <FieldError id={`profile-${name}-error`}>{fieldError}</FieldError>
                ) : null}
              </Field>
            );
          })}
        </FieldGroup>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <LoaderCircle data-icon="inline-start" aria-hidden="true" />
              Сохранение…
            </>
          ) : (
            "Сохранить изменения"
          )}
        </Button>
        {error ? (
          <p className="profile-message profile-message--error" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="profile-message" role="status">
            {status}
          </p>
        ) : null}
      </form>
    </section>
  );
}

function CurrentCart() {
  const items = useCartStore((state) => state.items);
  const validatedItems = items.map(validateCartItem);
  const activeItems = validatedItems.filter((entry) => entry.status !== "unavailable");
  const itemCount = activeItems.reduce((sum, { item }) => sum + item.quantity, 0);
  const total = activeItems.reduce(
    (sum, entry) => sum + entry.currentPrice * entry.item.quantity,
    0,
  );

  return (
    <section className="profile-card profile-card--cart" aria-labelledby="profile-cart-title">
      <header className="profile-card__header">
        <p className="text-label-caps text-secondary">Текущий выбор</p>
        <h2 id="profile-cart-title">Корзина</h2>
      </header>
      {items.length > 0 ? (
        <>
          <dl className="profile-cart-summary">
            <div>
              <dt>Позиций</dt>
              <dd>{itemCount}</dd>
            </div>
            <div>
              <dt>Предварительная сумма</dt>
              <dd>{priceFormatter.format(total)}</dd>
            </div>
          </dl>
          <p className="profile-card__note">
            Наличие и стоимость будут проверены перед оформлением.
          </p>
          <Link className="button button--secondary button--default" href="/checkout">
            Перейти к оформлению
          </Link>
        </>
      ) : (
        <div className="profile-empty">
          <ShoppingBag aria-hidden="true" />
          <p>В корзине пока ничего нет.</p>
          <Link className="button button--secondary button--default" href="/catalog">
            Выбрать мебель
          </Link>
        </div>
      )}
    </section>
  );
}

function OrderHistory({ orders }: Readonly<{ orders: readonly ProfileOrder[] }>) {
  return (
    <section className="profile-card profile-card--orders" aria-labelledby="profile-orders-title">
      <header className="profile-card__header">
        <p className="text-label-caps text-secondary">История</p>
        <h2 id="profile-orders-title">Заказы</h2>
        <p>Демонстрационные данные интерфейса до подключения серверной истории.</p>
      </header>
      {orders.length > 0 ? (
        <ul className="profile-orders">
          {orders.map((order) => (
            <li key={order.id}>
              <div className="profile-order__heading">
                <div>
                  <p className="profile-order__number">Заказ {order.id}</p>
                  <time dateTime={order.createdAt}>
                    {dateFormatter.format(new Date(`${order.createdAt}T00:00:00Z`))}
                  </time>
                </div>
                <span className="profile-order__status" data-status={order.status}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <dl className="profile-order__summary">
                <div>
                  <dt>Товаров</dt>
                  <dd>{order.itemCount}</dd>
                </div>
                <div>
                  <dt>Сумма</dt>
                  <dd>{priceFormatter.format(order.total)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <div className="profile-empty">
          <PackageCheck aria-hidden="true" />
          <p>Заказов пока нет.</p>
        </div>
      )}
    </section>
  );
}

export function ProfileDashboard({
  profile,
  orders,
}: Readonly<{ profile: ProfileDetails; orders: readonly ProfileOrder[] }>) {
  return (
    <div className="profile-dashboard">
      <ProfileForm profile={profile} />
      <CurrentCart />
      <OrderHistory orders={orders} />
    </div>
  );
}
