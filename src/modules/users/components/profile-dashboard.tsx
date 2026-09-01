"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, PackageCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUserSession } from "@/modules/auth/session-context";
import { useCartStore } from "@/modules/cart/store";
import { validateCartItem } from "@/modules/cart/validation";
import type { CustomerOrderDto } from "@/modules/orders/server/order-read";
import { profileDetailsSchema, type ProfileDetailsValues } from "@/modules/users/schemas";
import { formatMoney } from "@/shared/money";

const dateFormatter = new Intl.DateTimeFormat("ru-BY", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const statusLabels: Record<CustomerOrderDto["status"], string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

function ProfileForm({ profile }: Readonly<{ profile: ProfileDetailsValues }>) {
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
          const { updateOwnProfileAction } = await import("@/modules/users/server/actions");
          const result = await updateOwnProfileAction(values);
          if (!result.ok) {
            setError(
              result.code === "EMAIL_CONFLICT"
                ? "Этот email уже используется другим аккаунтом."
                : result.code === "UNAUTHENTICATED"
                  ? "Сессия завершилась. Войдите снова."
                  : "Не удалось обновить профиль.",
            );
            return;
          }
          form.reset(result.profile);
          setStatus("Контактные данные сохранены.");
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
  const activeItems = items.map(validateCartItem).filter((entry) => entry.status !== "unavailable");
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
              <dd>{formatMoney(total)}</dd>
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

function OrderHistory({ orders }: Readonly<{ orders: readonly CustomerOrderDto[] }>) {
  return (
    <section className="profile-card profile-card--orders" aria-labelledby="profile-orders-title">
      <header className="profile-card__header">
        <p className="text-label-caps text-secondary">История</p>
        <h2 id="profile-orders-title">Заказы</h2>
        <p>Показываем только заказы текущего аккаунта.</p>
      </header>
      {orders.length > 0 ? (
        <ul className="profile-orders">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <div className="profile-order__heading">
                <div>
                  <p className="profile-order__number">Заказ {order.orderNumber}</p>
                  <time dateTime={order.createdAt}>
                    {dateFormatter.format(new Date(order.createdAt))}
                  </time>
                </div>
                <span className="profile-order__status" data-status={order.status.toLowerCase()}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <dl className="profile-order__summary">
                <div>
                  <dt>Товаров</dt>
                  <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
                </div>
                <div>
                  <dt>Сумма</dt>
                  <dd>{formatMoney(order.total)}</dd>
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

export function ProfileDashboard() {
  const session = useUserSession();
  const [profile, setProfile] = useState<ProfileDetailsValues | null>(null);
  const [orders, setOrders] = useState<readonly CustomerOrderDto[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!session.authenticated) return;
    let active = true;
    async function loadDashboard() {
      const [{ getOwnProfileAction }, { listOwnOrdersAction }] = await Promise.all([
        import("@/modules/users/server/actions"),
        import("@/modules/orders/server/own-orders-action"),
      ]);
      const [profileResult, ordersResult] = await Promise.all([
        getOwnProfileAction(),
        listOwnOrdersAction({ limit: 20 }),
      ]);
      if (!active) return;
      if (!profileResult.ok || !ordersResult.ok) {
        setLoadError(true);
        return;
      }
      setProfile(profileResult.profile);
      setOrders(ordersResult.page.orders);
    }
    void loadDashboard().catch(() => {
      if (active) setLoadError(true);
    });
    return () => {
      active = false;
    };
  }, [session.authenticated]);

  if (session.pending)
    return (
      <p className="profile-message" role="status">
        Проверяем сессию и синхронизируем корзину…
      </p>
    );
  if (!session.authenticated) {
    return (
      <section className="profile-card" aria-labelledby="profile-session-title">
        <header className="profile-card__header">
          <p className="text-label-caps text-secondary">Сессия</p>
          <h2 id="profile-session-title">Войдите в аккаунт</h2>
          <p>Профиль, сохранённая корзина и история заказов доступны после входа.</p>
        </header>
        <Link className="button button--secondary button--default" href="/login">
          Войти
        </Link>
      </section>
    );
  }

  if (!profile || !orders) {
    return (
      <div className="profile-dashboard">
        <p
          className={loadError ? "profile-message profile-message--error" : "profile-message"}
          role={loadError ? "alert" : "status"}
        >
          {loadError
            ? "Не удалось загрузить личный кабинет. Попробуйте обновить страницу."
            : "Загружаем контактную информацию, корзину и заказы, включая заказы со статусом «В работе»…"}
        </p>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <section className="profile-card" aria-labelledby="profile-session-title">
        <header className="profile-card__header">
          <p className="text-label-caps text-secondary">Сессия</p>
          <h2 id="profile-session-title">Вход выполнен</h2>
          <p>Корзина синхронизируется с аккаунтом и хранится в PostgreSQL.</p>
        </header>
        <Button
          variant="secondary"
          disabled={session.pending}
          onClick={() => void session.signOut()}
        >
          {session.pending ? "Выход…" : "Выйти из аккаунта"}
        </Button>
        {session.error ? <p role="alert">{session.error}</p> : null}
      </section>
      <ProfileForm profile={profile} />
      <CurrentCart />
      <OrderHistory orders={orders} />
    </div>
  );
}
