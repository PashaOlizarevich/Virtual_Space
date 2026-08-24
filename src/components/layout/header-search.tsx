"use client";

import { Search, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    window.requestAnimationFrame(() => {
      rootRef.current?.querySelector<HTMLButtonElement>(".header-search__trigger")?.focus();
    });
  }, []);

  function openSearch() {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeSearch();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const query = inputRef.current?.value.trim() ?? "";

    if (!query) {
      event.preventDefault();
      return;
    }

    if (inputRef.current) inputRef.current.value = query;
  }

  return (
    <form
      ref={rootRef}
      className="header-search"
      data-state={isOpen ? "open" : "closed"}
      role="search"
      action="/catalog"
      method="get"
      onSubmit={handleSubmit}
    >
      <Input
        ref={inputRef}
        className="header-search__input"
        type="search"
        name="search"
        aria-label="Поиск товаров"
        placeholder="Поиск товаров"
        tabIndex={isOpen ? 0 : -1}
      />
      <Button
        className="header__icon-button header-search__trigger"
        variant="ghost"
        size="icon"
        aria-label={isOpen ? "Закрыть поиск" : "Открыть поиск"}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeSearch() : openSearch())}
      >
        {isOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
      </Button>
    </form>
  );
}
