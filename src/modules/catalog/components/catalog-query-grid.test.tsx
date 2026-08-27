import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  CatalogQueryGridView,
  getCatalogPageNumber,
  getResizedCatalogPage,
} from "@/modules/catalog/components/catalog-query-grid";
import { products } from "@/modules/catalog/mock-data";
import type { Product } from "@/modules/catalog/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const catalogProducts = Array.from({ length: 25 }, (_, index) => ({
  ...products[0],
  id: `catalog-${index + 1}`,
  slug: `catalog-${index + 1}`,
  name: `Товар ${index + 1}`,
})) satisfies Product[];

type MediaChangeListener = (event: MediaQueryListEvent) => void;

describe("CatalogQueryGrid pagination", () => {
  let container: HTMLDivElement;
  let root: Root;
  let isMobile: boolean;
  let mediaListeners: Set<MediaChangeListener>;

  beforeEach(() => {
    isMobile = false;
    mediaListeners = new Set();
    window.history.replaceState(null, "", "/catalog");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        get matches() {
          return isMobile;
        },
        media: "(max-width: 599px)",
        onchange: null,
        addEventListener: (_type: string, listener: MediaChangeListener) => {
          mediaListeners.add(listener);
        },
        removeEventListener: (_type: string, listener: MediaChangeListener) => {
          mediaListeners.delete(listener);
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => true,
      }),
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("normalizes invalid and out-of-range page values", () => {
    expect(getCatalogPageNumber(undefined, 3)).toBe(1);
    expect(getCatalogPageNumber("-2", 3)).toBe(1);
    expect(getCatalogPageNumber("2.5", 3)).toBe(1);
    expect(getCatalogPageNumber("not-a-page", 3)).toBe(1);
    expect(getCatalogPageNumber("99", 3)).toBe(3);
  });

  it("renders 12 desktop products and updates the URL and boundary controls", () => {
    act(() => root.render(<CatalogQueryGridView products={catalogProducts} />));

    expect(visibleProductNames()).toEqual(
      Array.from({ length: 12 }, (_, index) => `Товар ${index + 1}`),
    );
    expect(previousButton().disabled).toBe(true);
    expect(nextButton().disabled).toBe(false);
    expect(container.querySelectorAll(".catalog-pagination__indicator")).toHaveLength(3);

    nextButton().focus();
    act(() => nextButton().click());
    expect(visibleProductNames()[0]).toBe("Товар 13");
    expect(window.location.pathname + window.location.search).toBe("/catalog?page=2");
    expect(container.textContent).toContain("Страница 2 из 3");
    expect(document.activeElement).toBe(nextButton());

    act(() => nextButton().click());
    expect(visibleProductNames()).toEqual(["Товар 25"]);
    expect(nextButton().disabled).toBe(true);
  });

  it("renders five products on mobile and keeps the first desktop item visible after resize", () => {
    act(() =>
      root.render(<CatalogQueryGridView products={catalogProducts} initialPageParam="2" />),
    );
    expect(visibleProductNames()[0]).toBe("Товар 13");

    isMobile = true;
    act(() => {
      for (const listener of mediaListeners) listener({ matches: true } as MediaQueryListEvent);
    });

    expect(visibleProductNames()).toEqual([
      "Товар 11",
      "Товар 12",
      "Товар 13",
      "Товар 14",
      "Товар 15",
    ]);
    expect(window.location.search).toBe("?page=3");
    expect(container.querySelectorAll(".catalog-pagination__indicator")).toHaveLength(5);
  });

  it("interprets a direct mobile page URL with the mobile page size", () => {
    isMobile = true;
    act(() =>
      root.render(<CatalogQueryGridView products={catalogProducts} initialPageParam="2" />),
    );

    expect(visibleProductNames()).toEqual(["Товар 6", "Товар 7", "Товар 8", "Товар 9", "Товар 10"]);
    expect(container.textContent).toContain("Страница 2 из 5");
  });

  it("restores a page from browser history state", () => {
    act(() => root.render(<CatalogQueryGridView products={catalogProducts} />));
    act(() => nextButton().click());

    window.history.replaceState(null, "", "/catalog");
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(visibleProductNames()[0]).toBe("Товар 1");
    expect(previousButton().disabled).toBe(true);
  });

  it("switches only on a deliberate horizontal swipe outside interactive controls", () => {
    isMobile = true;
    act(() => root.render(<CatalogQueryGridView products={catalogProducts} />));
    const viewport = container.querySelector<HTMLElement>(".catalog-query__viewport");
    const refresh = container.querySelector<HTMLElement>(".catalog-query__toolbar button");
    if (!viewport || !refresh) throw new Error("Catalog swipe targets were not rendered");

    act(() => {
      dispatchTouch(viewport, "touchstart", 200, 20);
      dispatchTouch(viewport, "touchend", 160, 20);
      dispatchTouch(viewport, "touchstart", 200, 20);
      dispatchTouch(viewport, "touchend", 120, 120);
      dispatchTouch(refresh, "touchstart", 200, 20);
      dispatchTouch(viewport, "touchend", 100, 20);
    });
    expect(visibleProductNames()[0]).toBe("Товар 1");

    act(() => {
      dispatchTouch(viewport, "touchstart", 200, 20);
      dispatchTouch(viewport, "touchend", 100, 25);
    });
    expect(visibleProductNames()[0]).toBe("Товар 6");
    expect(window.location.search).toBe("?page=2");
  });

  function visibleProductNames() {
    return Array.from(container.querySelectorAll(".product-preview__name"), (node) =>
      node.textContent?.trim(),
    );
  }

  function previousButton() {
    const button = container.querySelector<HTMLButtonElement>(
      '[aria-label="Предыдущая страница каталога"]',
    );
    if (!button) throw new Error("Previous button was not rendered");
    return button;
  }

  function nextButton() {
    const button = container.querySelector<HTMLButtonElement>(
      '[aria-label="Следующая страница каталога"]',
    );
    if (!button) throw new Error("Next button was not rendered");
    return button;
  }
});

function dispatchTouch(target: HTMLElement, type: "touchstart" | "touchend", x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const touch = { clientX: x, clientY: y };
  Object.defineProperty(event, type === "touchstart" ? "touches" : "changedTouches", {
    value: [touch],
  });
  target.dispatchEvent(event);
}

describe("getResizedCatalogPage", () => {
  it("maps the first visible desktop product to its mobile page", () => {
    expect(getResizedCatalogPage(2, 12, 5, 25)).toBe(3);
    expect(getResizedCatalogPage(3, 5, 12, 25)).toBe(1);
  });
});
