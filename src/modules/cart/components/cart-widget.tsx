"use client";

import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/modules/cart/store";
import type { CartItem } from "@/modules/cart/types";
import { validateCartItem, type ValidatedCartItem } from "@/modules/cart/validation";
import type { Product } from "@/modules/catalog/types";
import { formatMoney } from "@/shared/money";

function getOptionLabels(item: CartItem, product: Product) {
  return item.selectedOptions.flatMap(({ groupId, optionId }) => {
    const group = product.optionGroups.find(({ id }) => id === groupId);
    const option = group?.options.find(({ id }) => id === optionId);
    return group && option ? [`${group.label}: ${option.label}`] : [];
  });
}

function CartLine({ entry }: Readonly<{ entry: ValidatedCartItem }>) {
  const { item, product } = entry;
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const confirmItemPrice = useCartStore((state) => state.confirmItemPrice);
  const isUnavailable = entry.status === "unavailable";
  const currentPrice = entry.status === "unavailable" ? null : entry.currentPrice;
  const productName = product?.name ?? "Товар больше недоступен";
  const optionLabels = product ? getOptionLabels(item, product) : [];

  return (
    <li className="cart-widget__item" data-status={entry.status}>
      {product ? (
        <Link
          className="cart-widget__media"
          href={`/product/${product.slug}`}
          onClick={() => document.querySelector<HTMLDialogElement>(".cart-widget__dialog")?.close()}
        >
          <Image src={product.image} alt={product.imageAlt} fill sizes="112px" />
        </Link>
      ) : (
        <div className="cart-widget__media cart-widget__media--unavailable" aria-hidden="true">
          <AlertTriangle />
        </div>
      )}
      <div className="cart-widget__item-content">
        <div className="cart-widget__item-heading">
          <div>
            {product ? (
              <Link
                className="cart-widget__item-name"
                href={`/product/${product.slug}`}
                onClick={() =>
                  document.querySelector<HTMLDialogElement>(".cart-widget__dialog")?.close()
                }
              >
                {productName}
              </Link>
            ) : (
              <p className="cart-widget__item-name">{productName}</p>
            )}
            {optionLabels.length > 0 ? (
              <p className="cart-widget__options">{optionLabels.join(" · ")}</p>
            ) : null}
            {isUnavailable ? (
              <p className="cart-widget__status" role="status">
                Недоступен — позиция исключена из суммы и оформления.
              </p>
            ) : entry.status === "price-changed" ? (
              <p className="cart-widget__status" role="status">
                Цена изменилась. Подтвердите новую стоимость.
              </p>
            ) : null}
          </div>
          {currentPrice !== null ? (
            <div className="cart-widget__item-price">
              {entry.status === "price-changed" ? (
                <del aria-label={`Прежняя цена: ${formatMoney(item.observedPrice)}`}>
                  {formatMoney(item.observedPrice)}
                </del>
              ) : null}
              <span aria-label={`Актуальная цена: ${formatMoney(currentPrice)}`}>
                {formatMoney(currentPrice * item.quantity)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="cart-widget__item-actions">
          {entry.status === "price-changed" ? (
            <Button variant="secondary" onClick={() => confirmItemPrice(item, entry.currentPrice)}>
              Подтвердить цену
            </Button>
          ) : (
            <div
              className="cart-widget__quantity"
              role="group"
              aria-label={`Количество товара «${productName}»`}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Уменьшить количество «${productName}»`}
                disabled={isUnavailable || item.quantity <= 1}
                onClick={() => setItemQuantity(item, item.quantity - 1)}
              >
                <Minus aria-hidden="true" />
              </Button>
              <output aria-live="polite" aria-label={`Количество: ${item.quantity}`}>
                {item.quantity}
              </output>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Увеличить количество «${productName}»`}
                disabled={isUnavailable || item.quantity >= 99}
                onClick={() => setItemQuantity(item, item.quantity + 1)}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          )}
          <Button
            className="cart-widget__remove"
            variant="ghost"
            size="icon"
            aria-label={`Удалить «${productName}» из корзины`}
            onClick={() => removeItem(item)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function CartWidget() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const items = useCartStore((state) => state.items);
  const validatedItems = items.map(validateCartItem);
  const activeItems = validatedItems.filter((entry) => entry.status !== "unavailable");
  const hasUnconfirmedPrices = validatedItems.some((entry) => entry.status === "price-changed");
  const canCheckout = activeItems.length > 0 && !hasUnconfirmedPrices;
  const itemCount = activeItems.reduce((total, { item }) => total + item.quantity, 0);
  const total = activeItems.reduce(
    (sum, entry) => sum + entry.currentPrice * entry.item.quantity,
    0,
  );

  function openCart() {
    dialogRef.current?.showModal();
  }

  function closeCart() {
    dialogRef.current?.close();
  }

  return (
    <div className="cart-widget">
      <Button
        id="cart-widget-trigger"
        className="header__icon-button cart-widget__trigger"
        variant="ghost"
        size="icon"
        aria-label={itemCount > 0 ? `Открыть корзину, товаров: ${itemCount}` : "Открыть корзину"}
        aria-haspopup="dialog"
        onClick={openCart}
      >
        <ShoppingBag aria-hidden="true" />
        {itemCount > 0 ? (
          <span className="cart-widget__count" aria-hidden="true">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        ) : null}
      </Button>

      <dialog
        ref={dialogRef}
        className="cart-widget__dialog"
        aria-labelledby="cart-widget-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeCart();
        }}
      >
        <section className="cart-widget__panel">
          <header className="cart-widget__header">
            <div>
              <p className="text-label-caps text-secondary">Ваш выбор</p>
              <h2 id="cart-widget-title">Корзина</h2>
            </div>
            <Button variant="ghost" size="icon" aria-label="Закрыть корзину" onClick={closeCart}>
              <X aria-hidden="true" />
            </Button>
          </header>

          {validatedItems.length > 0 ? (
            <ul className="cart-widget__items">
              {validatedItems.map((entry) => (
                <CartLine
                  key={`${entry.item.productId}:${entry.item.selectedOptions
                    .map(({ groupId, optionId }) => `${groupId}:${optionId}`)
                    .join("|")}`}
                  entry={entry}
                />
              ))}
            </ul>
          ) : (
            <div className="cart-widget__empty">
              <ShoppingBag aria-hidden="true" />
              <h3>Корзина пока пуста</h3>
              <p>Добавьте предметы из каталога — выбранные позиции сохранятся в этом браузере.</p>
              <Link
                className="button button--secondary button--default"
                href="/catalog"
                onClick={closeCart}
              >
                Перейти в каталог
              </Link>
            </div>
          )}

          <footer className="cart-widget__summary">
            <dl>
              <div>
                <dt>Количество товаров</dt>
                <dd>{itemCount}</dd>
              </div>
              <div className="cart-widget__total">
                <dt>Итого</dt>
                <dd>{formatMoney(total)}</dd>
              </div>
            </dl>
            <Link
              className="button button--primary button--default cart-widget__checkout"
              href="/checkout"
              aria-disabled={!canCheckout}
              tabIndex={!canCheckout ? -1 : undefined}
              onClick={(event) => {
                if (!canCheckout) event.preventDefault();
                else closeCart();
              }}
            >
              Оформить заявку
            </Link>
            {hasUnconfirmedPrices ? (
              <p className="cart-widget__checkout-notice" role="status">
                Подтвердите все изменившиеся цены, чтобы продолжить.
              </p>
            ) : null}
            <p>Итог будет проверен перед оформлением заявки.</p>
          </footer>
        </section>
      </dialog>
    </div>
  );
}
