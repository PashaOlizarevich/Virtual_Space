"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StoreLocation } from "@/modules/stores/types";

export function StoreSlider({ store }: { store: StoreLocation }) {
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
        <h2>{store.city}</h2>
        <address>{store.address}</address>
        <span className="store-card__rule" aria-hidden="true" />
        <p>{store.description}</p>
      </div>

      <div className="store-card__gallery">
        <div className="store-card__toolbar">
          <div
            className="store-card__tabs"
            role="tablist"
            aria-label={`Фотографии магазина в городе ${store.city}`}
          >
            {store.images.map((image, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                key={image.label}
              >
                {image.label}
              </button>
            ))}
          </div>

          <div className="store-card__controls">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Предыдущая фотография"
              onClick={selectPrevious}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <output aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(store.images.length).padStart(2, "0")}
            </output>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Следующая фотография"
              onClick={selectNext}
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="store-card__media" role="tabpanel">
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            sizes="(min-width: 900px) 66vw, 100vw"
          />
        </div>
      </div>
    </article>
  );
}
