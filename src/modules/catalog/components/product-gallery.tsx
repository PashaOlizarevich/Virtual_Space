"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FullscreenProductGallery } from "@/modules/catalog/components/fullscreen-product-gallery";
import { useGalleryNavigation } from "@/modules/catalog/hooks/use-gallery-navigation";
import type { ProductImage } from "@/modules/catalog/types";
import { FavoriteButton } from "@/modules/favorites/components/favorite-button";

type ProductGalleryProps = Readonly<{
  images: readonly ProductImage[];
  productId?: string;
  productName?: string;
}>;

export function ProductGallery({ images, productId, productName }: ProductGalleryProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const navigation = useGalleryNavigation(images.length);
  const { activeIndex, setActiveIndex, showPrevious, showNext } = navigation;
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  return (
    <section className="product-gallery" aria-label="Галерея товара">
      <div
        className="product-gallery__viewport"
        onTouchStart={(event) => {
          navigation.handleTouchStart(event.touches[0]?.clientX ?? 0);
        }}
        onTouchEnd={(event) => navigation.handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <button
          className="product-gallery__item"
          type="button"
          aria-label={`Открыть изображение ${activeIndex + 1} из ${images.length} на весь экран`}
          onClick={() => {
            if (!navigation.shouldIgnoreClick()) setIsFullscreenOpen(true);
          }}
        >
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            preload={activeIndex === 0}
            sizes="(max-width: 899px) 100vw, 58vw"
          />
        </button>
        {productId && productName ? (
          <FavoriteButton productId={productId} productName={productName} />
        ) : null}
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
      <FullscreenProductGallery
        images={images}
        initialIndex={activeIndex}
        open={isFullscreenOpen}
        productName={productName ?? "Товар"}
        onClose={() => setIsFullscreenOpen(false)}
      />
    </section>
  );
}
