"use client";

import { Heart, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/stores", label: "Магазины" },
  { href: "/catalog", label: "Новинки" },
  { href: "/catalog", label: "Акции" },
  { href: "/about", label: "О нас" },
] as const;

export function MobileNavigation() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openNavigation() {
    dialogRef.current?.showModal();
  }

  function closeNavigation() {
    dialogRef.current?.close();
  }

  return (
    <div className="mobile-navigation">
      <Button
        className="header__icon-button"
        variant="ghost"
        size="icon"
        aria-label="Открыть меню"
        aria-haspopup="dialog"
        onClick={openNavigation}
      >
        <Menu aria-hidden="true" />
      </Button>

      <dialog
        ref={dialogRef}
        className="mobile-navigation__dialog"
        aria-labelledby="mobile-navigation-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeNavigation();
        }}
      >
        <div className="mobile-navigation__panel">
          <div className="mobile-navigation__header">
            <p id="mobile-navigation-title" className="text-label-caps">
              Навигация
            </p>
            <Button variant="ghost" size="icon" aria-label="Закрыть меню" onClick={closeNavigation}>
              <X aria-hidden="true" />
            </Button>
          </div>

          <nav aria-label="Мобильная навигация">
            <ul className="mobile-navigation__links">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    closeNavigation();
                    setTimeout(() => {
                      const catalogDialog =
                        document.querySelector<HTMLDialogElement>("#catalog-menu-dialog");
                      if (catalogDialog && !catalogDialog.open) catalogDialog.showModal();
                    }, 0);
                  }}
                >
                  Каталог
                </button>
              </li>
              {navigationItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} prefetch={false} onClick={closeNavigation}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-navigation__actions">
            <Link
              className="mobile-navigation__action"
              href="/profile"
              prefetch={false}
              onClick={closeNavigation}
            >
              <UserRound aria-hidden="true" />
              Личный кабинет
            </Link>
            <Link
              className="mobile-navigation__action"
              href="/favorites"
              prefetch={false}
              onClick={closeNavigation}
            >
              <Heart aria-hidden="true" />
              Избранное
            </Link>
            <button
              className="mobile-navigation__action"
              type="button"
              onClick={() => {
                closeNavigation();
                const cartTrigger =
                  document.querySelector<HTMLButtonElement>("#cart-widget-trigger");
                cartTrigger?.focus();
                cartTrigger?.click();
              }}
            >
              <ShoppingBag aria-hidden="true" />
              Корзина
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
