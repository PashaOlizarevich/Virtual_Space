"use client";

import { ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StoreLocation } from "@/modules/stores/types";

export function StoreSlider({ store, storeNumber }: { store: StoreLocation; storeNumber: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = store.images[activeIndex];

  function selectPrevious() {
    setActiveIndex((current) => (current - 1 + store.images.length) % store.images.length);
  }

  function selectNext() {
    setActiveIndex((current) => (current + 1) % store.images.length);
  }

  return (
    <article className="store-card">
      <div className="store-card__details">
        <p className="store-card__number">{String(storeNumber).padStart(2, "0")}</p>
        <h2>Virtual Space {store.city}</h2>
        <div className="store-card__meta">
          <div>
            <MapPin aria-hidden="true" />
            <address>{store.address}</address>
          </div>
          <div>
            <Clock3 aria-hidden="true" />
            <p>{store.hours}</p>
          </div>
        </div>
      </div>

      <div className="store-card__gallery">
        <div className="store-card__media" role="tabpanel">
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            sizes="(min-width: 900px) 66vw, 100vw"
          />
          <Button
            className="store-card__arrow store-card__arrow--previous"
            variant="secondary"
            size="icon"
            aria-label="Предыдущая фотография"
            onClick={selectPrevious}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            className="store-card__arrow store-card__arrow--next"
            variant="secondary"
            size="icon"
            aria-label="Следующая фотография"
            onClick={selectNext}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>

        <div
          className="store-card__thumbnails"
          role="tablist"
          aria-label={`Фотографии магазина в городе ${store.city}`}
        >
          {store.images.map((image, index) => (
            <button
              type="button"
              role="tab"
              aria-label={image.label}
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              key={image.src}
            >
              <Image src={image.src} alt="" fill sizes="140px" />
            </button>
          ))}
        </div>
        <output className="sr-only" aria-live="polite">
          Фотография {activeIndex + 1} из {store.images.length}
        </output>
      </div>
    </article>
  );
}
