"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/modules/cart/store";
import type { CartItem } from "@/modules/cart/types";
import { products } from "@/modules/catalog/mock-data";
import type { Product } from "@/modules/catalog/types";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

function getOptionLabels(item: CartItem, product: Product) {
  return item.selectedOptions.flatMap(({ groupId, optionId }) => {
    const group = product.optionGroups.find(({ id }) => id === groupId);
    const option = group?.options.find(({ id }) => id === optionId);
    return group && option ? [`${group.label}: ${option.label}`] : [];
  });
}

function CartLine({ item, product }: Readonly<{ item: CartItem; product: Product }>) {
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const optionLabels = getOptionLabels(item, product);

  return (
    <li className="cart-widget__item">
      <Link
        className="cart-widget__media"
        href={`/product/${product.slug}`}
        onClick={() => document.querySelector<HTMLDialogElement>(".cart-widget__dialog")?.close()}
      >
        <Image src={product.image} alt={product.imageAlt} fill sizes="112px" />
      </Link>
      <div className="cart-widget__item-content">
        <div className="cart-widget__item-heading">
          <div>
            <Link
              className="cart-widget__item-name"
              href={`/product/${product.slug}`}
              onClick={() =>
                document.querySelector<HTMLDialogElement>(".cart-widget__dialog")?.close()
              }
            >
              {product.name}
            </Link>
            {optionLabels.length > 0 ? (
              <p className="cart-widget__options">{optionLabels.join(" · ")}</p>
            ) : null}
          </div>
          <p className="cart-widget__item-price">
            {priceFormatter.format(item.observedPrice * item.quantity)}
          </p>
        </div>

        <div className="cart-widget__item-actions">
          <div
            className="cart-widget__quantity"
            role="group"
            aria-label={`Количество товара «${product.name}»`}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Уменьшить количество «${product.name}»`}
              disabled={item.quantity <= 1}
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
              aria-label={`Увеличить количество «${product.name}»`}
              disabled={item.quantity >= 99}
              onClick={() => setItemQuantity(item, item.quantity + 1)}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
          <Button
            className="cart-widget__remove"
            variant="ghost"
            size="icon"
            aria-label={`Удалить «${product.name}» из корзины`}
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
  const visibleItems = items.flatMap((item) => {
    const product = products.find(({ id }) => id === item.productId);
    return product ? [{ item, product }] : [];
  });
  const itemCount = visibleItems.reduce((total, { item }) => total + item.quantity, 0);
  const total = visibleItems.reduce((sum, { item }) => sum + item.observedPrice * item.quantity, 0);

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

          {visibleItems.length > 0 ? (
            <ul className="cart-widget__items">
              {visibleItems.map(({ item, product }) => (
                <CartLine
                  key={`${item.productId}:${item.selectedOptions
                    .map(({ groupId, optionId }) => `${groupId}:${optionId}`)
                    .join("|")}`}
                  item={item}
                  product={product}
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
                <dd>{priceFormatter.format(total)}</dd>
              </div>
            </dl>
            <Link
              className="button button--primary button--default cart-widget__checkout"
              href="/checkout"
              aria-disabled={visibleItems.length === 0}
              tabIndex={visibleItems.length === 0 ? -1 : undefined}
              onClick={(event) => {
                if (visibleItems.length === 0) event.preventDefault();
                else closeCart();
              }}
            >
              Оформить заявку
            </Link>
            <p>Итог будет проверен перед оформлением заявки.</p>
          </footer>
        </section>
      </dialog>
    </div>
  );
}
