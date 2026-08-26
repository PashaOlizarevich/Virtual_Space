import Image from "next/image";

import type { Product } from "@/modules/catalog/types";
import type { Promotion } from "@/modules/promotions/types";

const periodFormatter = new Intl.DateTimeFormat("ru-BY", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function formatPeriod(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startLabel = periodFormatter.format(start);
  const endLabel = periodFormatter.format(end);
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  return startYear === endYear
    ? `${startLabel} — ${endLabel} ${endYear}`
    : `${startLabel} ${startYear} — ${endLabel} ${endYear}`;
}

type PromotionHeroProps = Readonly<{
  promotion: Promotion;
  featuredProduct: Product;
}>;

export function PromotionHero({ promotion, featuredProduct }: PromotionHeroProps) {
  const period = formatPeriod(promotion.startsAt, promotion.endsAt);

  return (
    <section className="promotion-hero" aria-labelledby="promotion-title">
      <div className="promotion-hero__content">
        <h1 id="promotion-title">{promotion.title}</h1>
        <p className="promotion-hero__description">{promotion.description}</p>
        <p className="promotion-hero__period">
          <span className="sr-only">Период акции: </span>
          {period}
        </p>
        <a className="button button--primary button--default" href="#sale-products">
          Смотреть предметы
        </a>
      </div>
      <div className="promotion-hero__media">
        <Image
          src={featuredProduct.image}
          alt={featuredProduct.imageAlt}
          fill
          sizes="(max-width: 899px) 100vw, 52vw"
          quality={100}
          priority
        />
      </div>
    </section>
  );
}
