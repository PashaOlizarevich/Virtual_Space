"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/modules/cart/store";
import type { Product } from "@/modules/catalog/types";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

type ProductPreviewProps = Readonly<{
  product: Product;
  imageSizes?: string;
  imageQuality?: 75 | 100;
}>;

export function ProductPreview({
  product,
  imageSizes = "(max-width: 599px) 100vw, (max-width: 899px) 50vw, 25vw",
  imageQuality = 75,
}: ProductPreviewProps) {
  const addItem = useCartStore((state) => state.addItem);
  const productHref = `/product/${product.slug}`;
  const dimensions = product.specifications.find(({ label }) => label === "Размер")?.value;

  return (
    <article className="product-preview">
      <div className="product-preview__media">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes={imageSizes}
          quality={imageQuality}
        />
      </div>
      <div className="product-preview__content">
        <div className="product-preview__heading">
          <h3 className="product-preview__name">{product.name}</h3>
          <p className="product-preview__price">{priceFormatter.format(product.price)}</p>
        </div>
        <p className="product-preview__description text-body-sm text-secondary">
          {product.description}
        </p>
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
                observedPrice: product.price,
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
          <p>{priceFormatter.format(product.price)}</p>
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
    </article>
  );
}
