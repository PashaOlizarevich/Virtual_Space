import Image from "next/image";
import type { ProductImage } from "@/modules/catalog/types";

export function ProductGallery({ images }: Readonly<{ images: readonly ProductImage[] }>) {
  return (
    <div className="product-gallery" aria-label="Галерея товара">
      {images.map((image, index) => (
        <figure className="product-gallery__item" key={image.src}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 899px) 100vw, 58vw"
          />
        </figure>
      ))}
    </div>
  );
}
