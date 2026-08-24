import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { ProductGallery } from "@/modules/catalog/components/product-gallery";
import type { ProductImage } from "@/modules/catalog/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const images = [
  { src: "/images/sofas/modul-sofa/01-main.png", alt: "Диван Modul, основной вид" },
  { src: "/images/sofas/modul-sofa/02-front.png", alt: "Диван Modul, вид спереди" },
] as const satisfies readonly ProductImage[];

describe("ProductGallery", () => {
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

  it("switches images with carousel controls and thumbnails", () => {
    act(() => root.render(<ProductGallery images={images} />));
    const activeImage = () =>
      container.querySelector<HTMLImageElement>(".product-gallery__item img");

    expect(activeImage()?.alt).toBe("Диван Modul, основной вид");
    act(() => {
      container.querySelector<HTMLButtonElement>('[aria-label="Следующее изображение"]')?.click();
    });
    expect(activeImage()?.alt).toBe("Диван Modul, вид спереди");
    expect(container.querySelector(".product-gallery__counter")?.textContent).toContain("2 / 2");

    act(() => {
      container.querySelectorAll<HTMLButtonElement>(".product-gallery__thumbnail")[0]?.click();
    });
    expect(activeImage()?.alt).toBe("Диван Modul, основной вид");
  });

  it("keeps a single image gallery free of inactive controls", () => {
    act(() => root.render(<ProductGallery images={[images[0]]} />));

    expect(container.querySelector(".product-gallery__item img")?.getAttribute("alt")).toBe(
      "Диван Modul, основной вид",
    );
    expect(container.querySelector(".product-gallery__arrow")).toBeNull();
    expect(container.querySelector(".product-gallery__thumbnails")).toBeNull();
  });
});
