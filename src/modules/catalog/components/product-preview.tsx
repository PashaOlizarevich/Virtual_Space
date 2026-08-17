import Image from "next/image";

import type { ProductPreview as ProductPreviewData } from "@/modules/catalog/types";

const priceFormatter = new Intl.NumberFormat("ru-BY", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 0,
});

export function ProductPreview({ product }: Readonly<{ product: ProductPreviewData }>) {
  return (
    <article className="product-preview">
      <div className="product-preview__media">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 25vw"
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
      </div>
    </article>
  );
}
