"use client";

import { ArrowRight, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

const categoryGroups = [
  ["Диваны", "Кресла", "Пуфики"],
  ["Стулья", "Столы обеденные", "Столы для гостиной"],
  ["Кровати", "Матрасы"],
  ["Текстиль и декор", "Посуда"],
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
    dialogRef.current?.close();
  }, [pathname]);

  function openMenu() {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function closeMenu() {
    dialogRef.current?.close();
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
      onClose={() => setIsOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeMenu();
      }}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <div className="catalog-menu__panel">
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
                <li key={category}>
                  <Link href="/catalog" prefetch={false} onClick={closeMenu}>
                    {category}
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
