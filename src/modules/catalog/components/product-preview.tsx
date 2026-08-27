"use client";

import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/modules/cart/store";
import { FullscreenProductGallery } from "@/modules/catalog/components/fullscreen-product-gallery";
import { useGalleryNavigation } from "@/modules/catalog/hooks/use-gallery-navigation";
import type { Product } from "@/modules/catalog/types";
import { FavoriteButton } from "@/modules/favorites/components/favorite-button";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

type ProductPreviewProps = Readonly<{
  product: Product;
  imageSizes?: string;
  imageQuality?: 75 | 100;
  imageLoading?: "eager" | "lazy";
  showNewBadge?: boolean;
  pricing?: Readonly<{
    originalPrice: number;
    currentPrice: number;
    discountPercent: number;
    promotionId: string;
  }>;
}>;

export function ProductPreview({
  product,
  imageSizes = "(max-width: 599px) 100vw, (max-width: 899px) 50vw, 25vw",
  imageQuality = 75,
  imageLoading = "lazy",
  showNewBadge = false,
  pricing,
}: ProductPreviewProps) {
  const addItem = useCartStore((state) => state.addItem);
  const images =
    product.gallery.length > 0 ? product.gallery : [{ src: product.image, alt: product.imageAlt }];
  const navigation = useGalleryNavigation(images.length);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const activeImage = images[navigation.activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;
  const productHref = `/product/${product.slug}`;
  const dimensions = product.specifications.find(({ label }) => label === "Размер")?.value;

  return (
    <article className="product-preview">
      <div className="product-preview__media">
        <button
          className="product-preview__image-trigger"
          type="button"
          aria-label={`Открыть изображение ${navigation.activeIndex + 1} из ${images.length} товара «${product.name}» на весь экран`}
          onClick={() => {
            if (!navigation.shouldIgnoreClick()) setIsFullscreenOpen(true);
          }}
          onTouchStart={(event) => navigation.handleTouchStart(event.touches[0]?.clientX ?? 0)}
          onTouchEnd={(event) => navigation.handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            sizes={imageSizes}
            quality={imageQuality}
            loading={imageLoading}
          />
        </button>
        {showNewBadge ? <span className="product-preview__badge">Новинка</span> : null}
        <FavoriteButton productId={product.id} productName={product.name} />
        {hasMultipleImages ? (
          <>
            <Button
              className="product-preview__arrow product-preview__arrow--previous"
              size="icon"
              variant="secondary"
              aria-label="Предыдущее изображение"
              onClick={(event) => {
                event.stopPropagation();
                navigation.showPrevious();
              }}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              className="product-preview__arrow product-preview__arrow--next"
              size="icon"
              variant="secondary"
              aria-label="Следующее изображение"
              onClick={(event) => {
                event.stopPropagation();
                navigation.showNext();
              }}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <p className="product-preview__counter" aria-live="polite" aria-atomic="true">
              {navigation.activeIndex + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>
      <div className="product-preview__content">
        <div className="product-preview__heading">
          <h3 className="product-preview__name">{product.name}</h3>
          {pricing ? (
            <div
              className="product-preview__promotional-price"
              aria-label={`Цена по акции ${priceFormatter.format(pricing.currentPrice)}, прежняя цена ${priceFormatter.format(pricing.originalPrice)}, скидка ${pricing.discountPercent}%`}
            >
              <span className="product-preview__original-price" aria-hidden="true">
                {priceFormatter.format(pricing.originalPrice)}
              </span>
              <span className="product-preview__price" aria-hidden="true">
                {priceFormatter.format(pricing.currentPrice)}
              </span>
            </div>
          ) : (
            <p className="product-preview__price">{priceFormatter.format(product.price)}</p>
          )}
        </div>
        <p className="product-preview__description text-body-sm text-secondary">
          {product.description}
        </p>
        {pricing ? (
          <p className="product-preview__discount text-body-sm">
            Скидка {pricing.discountPercent}%
          </p>
        ) : null}
        <div className="product-preview__actions">
          <Link className="button button--secondary button--default" href={productHref}>
            Подробнее
          </Link>
          <Button
            aria-label={`Добавить «${product.name}» в корзину`}
            onClick={() =>
              addItem({
                productId: product.id,
                selectedOptions: [],
                observedPrice: pricing?.currentPrice ?? product.price,
              })
            }
          >
            <ShoppingBag data-icon="inline-start" aria-hidden="true" />
            Добавить в корзину
          </Button>
        </div>
      </div>
      <aside
        className="product-preview__quick-view"
        aria-label={`Кратко о товаре «${product.name}»`}
      >
        <p className="text-label-caps text-secondary">Быстрый просмотр</p>
        <div className="product-preview__quick-heading">
          <h4>{product.name}</h4>
          <p>{priceFormatter.format(pricing?.currentPrice ?? product.price)}</p>
        </div>
        <p className="text-body-sm text-secondary">{product.description}</p>
        {dimensions ? (
          <p className="product-preview__quick-dimensions">
            <span className="text-secondary">Размеры</span>
            <span>{dimensions}</span>
          </p>
        ) : null}
        <Link className="button button--primary button--default" href={productHref}>
          Перейти к товару
        </Link>
      </aside>
      <FullscreenProductGallery
        images={images}
        initialIndex={navigation.activeIndex}
        open={isFullscreenOpen}
        productName={product.name}
        onClose={() => setIsFullscreenOpen(false)}
      />
    </article>
  );
}
