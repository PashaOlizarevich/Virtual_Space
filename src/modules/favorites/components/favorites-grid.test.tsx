import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { allProducts } from "@/modules/catalog/mock-data";
import { FavoritesGrid } from "@/modules/favorites/components/favorites-grid";
import { useFavoritesStore } from "@/modules/favorites/store";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("FavoritesGrid", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    window.localStorage.clear();
    useFavoritesStore.setState({ productIds: [] });
    await useFavoritesStore.persist.rehydrate();
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders the empty state and catalog link", () => {
    act(() => root.render(<FavoritesGrid products={allProducts} />));

    expect(container.textContent).toContain("Здесь будут ваши избранные товары");
    expect(container.querySelector('a[href="/catalog"]')).not.toBeNull();
  });

  it("renders known products in saved order and ignores unknown IDs", () => {
    const first = allProducts[0];
    const second = allProducts[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;

    act(() => {
      useFavoritesStore.getState().replace([second.id, "removed-product", first.id]);
      root.render(<FavoritesGrid products={allProducts} />);
    });

    const names = [...container.querySelectorAll(".product-preview__name")].map(
      (element) => element.textContent,
    );
    expect(names).toEqual([second.name, first.name]);

    const removeButton = container.querySelector<HTMLButtonElement>(
      `.product-preview__favorite[aria-label="Удалить «${second.name}» из избранного"]`,
    );
    act(() => removeButton?.click());
    expect(container.textContent).not.toContain(second.name);
  });
});
