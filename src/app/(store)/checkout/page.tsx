import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { CheckoutForm } from "@/modules/checkout/components/checkout-form";

export const metadata: Metadata = {
  title: "Оформление заявки",
  description: "Контактные данные для оформления заявки в Virtual Space.",
};

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <Container>
        <nav className="checkout-page__breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/catalog">Каталог</Link>
          <span aria-hidden="true">/</span>
          <span>Оформление заявки</span>
        </nav>
        <div className="checkout-page__layout">
          <header className="checkout-page__intro">
            <p className="text-label-caps text-secondary">Завершение выбора</p>
            <h1>Оформление заявки</h1>
            <p>
              Оставьте контактные данные. Мы свяжемся с вами, чтобы подтвердить состав заказа,
              стоимость и удобное время доставки.
            </p>
          </header>
          <CheckoutForm />
        </div>
      </Container>
    </main>
  );
}
