"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/modules/catalog/types";

const SWIPE_THRESHOLD = 48;

export function ProductGallery({ images }: Readonly<{ images: readonly ProductImage[] }>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const distance = clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    if (distance > 0) showPrevious();
    else showNext();
  }

  return (
    <section
      className="product-gallery"
      aria-label="Галерея товара"
      onKeyDown={(event) => {
        if (!hasMultipleImages) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPrevious();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNext();
        }
      }}
    >
      <div
        className="product-gallery__viewport"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <figure className="product-gallery__item">
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            preload={activeIndex === 0}
            sizes="(max-width: 899px) 100vw, 58vw"
          />
        </figure>
        {hasMultipleImages ? (
          <>
            <Button
              className="product-gallery__arrow product-gallery__arrow--previous"
              aria-label="Предыдущее изображение"
              size="icon"
              variant="secondary"
              onClick={showPrevious}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              className="product-gallery__arrow product-gallery__arrow--next"
              aria-label="Следующее изображение"
              size="icon"
              variant="secondary"
              onClick={showNext}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <p className="product-gallery__counter" aria-live="polite" aria-atomic="true">
              {activeIndex + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="product-gallery__thumbnails" aria-label="Выбор изображения">
          {images.map((image, index) => (
            <button
              className="product-gallery__thumbnail"
              data-active={index === activeIndex}
              type="button"
              aria-label={`Показать изображение ${index + 1} из ${images.length}`}
              aria-pressed={index === activeIndex}
              key={image.src}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={image.src} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
