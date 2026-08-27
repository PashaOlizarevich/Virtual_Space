import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ProductPreview } from "@/modules/catalog/components/product-preview";
import type { Product } from "@/modules/catalog/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const product = {
  id: "gallery-product",
  slug: "gallery-product",
  name: "Gallery product",
  description: "Description",
  price: 100,
  currency: "BYN",
  image: "/fallback.png",
  imageAlt: "Fallback image",
  gallery: [
    { src: "/one.png", alt: "First image" },
    { src: "/two.png", alt: "Second image" },
  ],
  specifications: [],
  optionGroups: [],
} as const satisfies Product;

describe("ProductPreview gallery", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("uses the dynamic gallery and cycles in both directions", () => {
    act(() => root.render(<ProductPreview product={product} />));
    const activeImage = () =>
      container.querySelector<HTMLImageElement>(".product-preview__image-trigger img");

    expect(activeImage()?.alt).toBe("First image");
    expect(container.querySelector(".product-preview__counter")?.textContent).toContain("1 / 2");

    act(() =>
      container.querySelector<HTMLButtonElement>('[aria-label="Предыдущее изображение"]')?.click(),
    );
    expect(activeImage()?.alt).toBe("Second image");
    act(() =>
      container.querySelector<HTMLButtonElement>('[aria-label="Следующее изображение"]')?.click(),
    );
    expect(activeImage()?.alt).toBe("First image");
  });

  it("falls back to the primary image without multi-image controls", () => {
    act(() => root.render(<ProductPreview product={{ ...product, gallery: [] }} />));

    expect(
      container.querySelector(".product-preview__image-trigger img")?.getAttribute("alt"),
    ).toBe("Fallback image");
    expect(container.querySelector(".product-preview__arrow")).toBeNull();
    expect(container.querySelector(".product-preview__counter")).toBeNull();
  });
});
