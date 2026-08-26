import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ProductGallery } from "@/modules/catalog/components/product-gallery";
import { useFavoritesStore } from "@/modules/favorites/store";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("ProductGallery favorite control", () => {
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

  it("shows the card-style heart over the product photo and toggles the product", () => {
    act(() =>
      root.render(
        <ProductGallery
          images={[{ src: "/product.png", alt: "Товар" }]}
          productId="forma-armchair"
          productName="Forma"
        />,
      ),
    );
    const button = container.querySelector<HTMLButtonElement>(".product-preview__favorite");

    expect(button?.closest(".product-gallery__viewport")).not.toBeNull();
    expect(button?.getAttribute("aria-pressed")).toBe("false");
    expect(button?.getAttribute("aria-label")).toBe("Добавить «Forma» в избранное");

    act(() => button?.click());

    expect(useFavoritesStore.getState().productIds).toEqual(["forma-armchair"]);
    expect(button?.getAttribute("aria-pressed")).toBe("true");
    expect(button?.getAttribute("aria-label")).toBe("Удалить «Forma» из избранного");
  });
});
