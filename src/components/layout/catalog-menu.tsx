"use client";

import { ArrowRight, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { TransitionEvent } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

const categoryGroups = [
  [
    { label: "Диваны", href: "/catalog/sofas" },
    { label: "Кресла", href: "/catalog/armchairs" },
    { label: "Пуфики", href: "/catalog/poufs" },
  ],
  [
    { label: "Стулья", href: "/catalog/chairs" },
    { label: "Столы обеденные", href: "/catalog/dining-tables" },
    { label: "Столы для гостиной", href: "/catalog/living-room-tables" },
  ],
  [
    { label: "Кровати", href: "/catalog/beds" },
    { label: "Матрасы", href: "/catalog/mattresses" },
  ],
  [
    { label: "Текстиль и декор", href: "/catalog/textiles-decor" },
    { label: "Посуда", href: "/catalog/tableware" },
  ],
] as const;

const subscribeToMount = () => () => undefined;

export function CatalogMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, [pathname]);

  function openMenu() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.dataset.state = "open";
    dialog.showModal();
  }

  function closeMenu() {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.dataset.state === "closing") return;

    setIsOpen(false);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }

    dialog.dataset.state = "closing";
  }

  function finishClosing(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "transform" &&
      dialogRef.current?.dataset.state === "closing"
    ) {
      dialogRef.current.close();
    }
  }

  const trigger = (
    <Button
      id="catalog-menu-trigger"
      className="catalog-menu__trigger"
      variant="ghost"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="catalog-menu-dialog"
      onClick={openMenu}
    >
      Каталог
      <ChevronDown aria-hidden="true" />
    </Button>
  );

  const dialog = (
    <dialog
      id="catalog-menu-dialog"
      ref={dialogRef}
      className="catalog-menu__dialog"
      aria-labelledby="catalog-menu-title"
      data-state="closed"
      onCancel={(event) => {
        event.preventDefault();
        closeMenu();
      }}
      onClose={() => setIsOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeMenu();
      }}
      onToggle={(event) => {
        if (event.currentTarget.open) event.currentTarget.dataset.state = "open";
        setIsOpen(event.currentTarget.open);
      }}
    >
      <div className="catalog-menu__panel" onTransitionEnd={finishClosing}>
        <div className="catalog-menu__header">
          <p id="catalog-menu-title">Категории</p>
          <Button variant="ghost" size="icon" aria-label="Закрыть каталог" onClick={closeMenu}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="catalog-menu__groups">
          {categoryGroups.map((group, index) => (
            <ul key={index}>
              {group.map((category) => (
                <li key={category.label}>
                  <Link href={category.href} prefetch={false} onClick={closeMenu}>
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <Link className="catalog-menu__all" href="/catalog" prefetch={false} onClick={closeMenu}>
          <span>Весь каталог</span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </dialog>
  );

  return (
    <>
      {trigger}
      {isMounted ? createPortal(dialog, document.body) : dialog}
    </>
  );
}
