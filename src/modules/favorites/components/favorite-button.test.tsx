import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { FavoriteButton } from "@/modules/favorites/components/favorite-button";
import { useFavoritesStore } from "@/modules/favorites/store";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("FavoriteButton", () => {
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

  it("toggles pressed state and accessible label", () => {
    act(() => root.render(<FavoriteButton productId="forma-armchair" productName="Forma" />));
    const button = container.querySelector<HTMLButtonElement>("button");

    expect(button?.getAttribute("aria-pressed")).toBe("false");
    expect(button?.getAttribute("aria-label")).toBe("Добавить «Forma» в избранное");

    act(() => button?.click());
    expect(button?.getAttribute("aria-pressed")).toBe("true");
    expect(button?.getAttribute("aria-label")).toBe("Удалить «Forma» из избранного");

    act(() => button?.click());
    expect(button?.getAttribute("aria-pressed")).toBe("false");
  });
});
