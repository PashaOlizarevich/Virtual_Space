"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useGalleryNavigation } from "@/modules/catalog/hooks/use-gallery-navigation";
import type { ProductImage } from "@/modules/catalog/types";

type FullscreenProductGalleryProps = Readonly<{
  images: readonly ProductImage[];
  initialIndex: number;
  open: boolean;
  productName: string;
  onClose: () => void;
}>;

export function FullscreenProductGallery({
  images,
  initialIndex,
  open,
  productName,
  onClose,
}: FullscreenProductGalleryProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const navigation = useGalleryNavigation(images.length, initialIndex);
  const { activeIndex, setActiveIndex, showPrevious, showNext } = navigation;
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));
  }, [images.length, initialIndex, open, setActiveIndex]);

  useEffect(() => {
    if (!open) return;
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>(".fullscreen-gallery__close")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (hasMultipleImages && event.key === "ArrowLeft") showPrevious();
      if (hasMultipleImages && event.key === "ArrowRight") showNext();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [hasMultipleImages, onClose, open, showNext, showPrevious]);

  if (!open || !activeImage) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fullscreen-gallery"
      role="dialog"
      aria-modal="true"
      aria-label={`Полноэкранная галерея товара «${productName}»`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Button
        className="fullscreen-gallery__close"
        size="icon"
        variant="secondary"
        aria-label="Закрыть полноэкранную галерею"
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </Button>
      <div
        className="fullscreen-gallery__viewport"
        onTouchStart={(event) => navigation.handleTouchStart(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={(event) => navigation.handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="100vw"
          quality={100}
          loading="eager"
        />
      </div>
      {hasMultipleImages ? (
        <>
          <Button
            className="fullscreen-gallery__arrow fullscreen-gallery__arrow--previous"
            size="icon"
            variant="secondary"
            aria-label="Предыдущее изображение"
            onClick={showPrevious}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            className="fullscreen-gallery__arrow fullscreen-gallery__arrow--next"
            size="icon"
            variant="secondary"
            aria-label="Следующее изображение"
            onClick={showNext}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <p className="fullscreen-gallery__counter" aria-live="polite" aria-atomic="true">
            {activeIndex + 1} / {images.length}
          </p>
        </>
      ) : null}
    </div>,
    document.body,
  );
}
