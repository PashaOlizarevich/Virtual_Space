import { Box, Leaf, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProductPreview } from "@/modules/catalog/components/product-preview";
import { getPublicCatalog } from "@/modules/catalog/server/service";
import { getPublicStoreSettings } from "@/modules/settings/server/service";

const advantages = [
  {
    title: "Честные материалы",
    description: "Выбираем натуральные и долговечные материалы, безопасные для дома.",
    icon: Leaf,
  },
  {
    title: "Продуманный дизайн",
    description: "Лаконичные формы и внимание к деталям для гармоничных интерьеров.",
    icon: Box,
  },
  {
    title: "Заботливая доставка",
    description: "Аккуратно доставим и соберём мебель в удобное для вас время.",
    icon: Truck,
  },
] as const;

export default async function HomePage() {
  const [catalog, storeProfile] = await Promise.all([
    getPublicCatalog({ pageSize: 4 }),
    getPublicStoreSettings(),
  ]);

  if (!storeProfile) throw new Error("Primary public store settings are not configured");

  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <Image
          className="home-hero__image"
          src="/images/home/hero-v2.png"
          alt="Светлая гостиная с модульным диваном и мебелью из ореха"
          fill
          preload
          quality={100}
          sizes="100vw"
        />
        <Container className="home-hero__container">
          <div className="home-hero__content">
            <h1 id="home-title" className="home-hero__title">
              Пространство, в котором хочется остаться
            </h1>
            <p className="home-hero__description">{storeProfile.description}</p>
            <Link className="button button--primary button--default" href="#showcase">
              Смотреть коллекцию
            </Link>
          </div>
        </Container>
      </section>

      <Container>
        <Section id="showcase" className="home-showcase" aria-labelledby="showcase-title">
          <div className="home-section-heading">
            <p className="text-label-caps text-secondary">Коллекция</p>
            <h2 id="showcase-title" className="text-heading-lg">
              Избранное для вашего дома
            </h2>
          </div>
          <div className="home-showcase__grid">
            {catalog.products.map((product) => (
              <ProductPreview key={product.id} product={product} />
            ))}
          </div>
        </Section>

        <Section className="home-advantages" aria-labelledby="advantages-title">
          <h2 id="advantages-title" className="text-heading-lg">
            Почему Virtual Space
          </h2>
          <div className="home-advantages__grid">
            {advantages.map(({ title, description, icon: Icon }) => (
              <article className="home-advantage" key={title}>
                <Icon className="home-advantage__icon" aria-hidden="true" />
                <h3>{title}</h3>
                <p className="text-body-sm text-secondary">{description}</p>
              </article>
            ))}
          </div>
        </Section>
      </Container>
    </main>
  );
}
