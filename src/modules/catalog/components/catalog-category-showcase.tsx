import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { CategoryDto } from "@/modules/catalog/server/dto";

type CatalogCategory = Readonly<{
  slug: string;
  title: string;
  description: string;
  href: `/catalog/${string}`;
  image: string;
  size: "feature" | "medium" | "compact";
}>;

const catalogCategories = [
  {
    slug: "sofas",
    title: "Диваны",
    description: "Мягкий центр дома для отдыха, общения и долгих вечеров.",
    href: "/catalog/sofas",
    image: "/images/catalog-categories/sofas.png",
    size: "feature",
  },
  {
    slug: "armchairs",
    title: "Кресла",
    description: "Личное место для чтения, тишины и неспешного отдыха.",
    href: "/catalog/armchairs",
    image: "/images/catalog-categories/armchairs.png",
    size: "medium",
  },
  {
    slug: "poufs",
    title: "Пуфики",
    description: "Мягкие формы, которые легко следуют за ритмом комнаты.",
    href: "/catalog/poufs",
    image: "/images/catalog-categories/poufs.png",
    size: "compact",
  },
  {
    slug: "chairs",
    title: "Стулья",
    description: "Выверенные линии для повседневных встреч за столом.",
    href: "/catalog/chairs",
    image: "/images/catalog-categories/chairs.png",
    size: "medium",
  },
  {
    slug: "dining-tables",
    title: "Столы обеденные",
    description: "Пространство для общих завтраков и тёплых разговоров.",
    href: "/catalog/dining-tables",
    image: "/images/catalog-categories/dining-tables.png",
    size: "feature",
  },
  {
    slug: "living-room-tables",
    title: "Столы для гостиной",
    description: "Поверхности для книг, керамики и вещей под рукой.",
    href: "/catalog/living-room-tables",
    image: "/images/catalog-categories/living-room-tables.png",
    size: "compact",
  },
  {
    slug: "beds",
    title: "Кровати",
    description: "Спокойная основа для глубокого сна и медленного утра.",
    href: "/catalog/beds",
    image: "/images/catalog-categories/beds.png",
    size: "medium",
  },
  {
    slug: "mattresses",
    title: "Матрасы",
    description: "Продуманная поддержка из естественных и тактильных слоёв.",
    href: "/catalog/mattresses",
    image: "/images/catalog-categories/mattresses.png",
    size: "compact",
  },
  {
    slug: "textiles-decor",
    title: "Текстиль и декор",
    description: "Фактуры и детали, которые делают пространство личным.",
    href: "/catalog/textiles-decor",
    image: "/images/catalog-categories/textiles-decor.png",
    size: "medium",
  },
  {
    slug: "tableware",
    title: "Посуда",
    description: "Керамика для тихих завтраков и собранной сервировки.",
    href: "/catalog/tableware",
    image: "/images/catalog-categories/tableware.png",
    size: "compact",
  },
] as const satisfies readonly CatalogCategory[];

export function CatalogCategoryShowcase({
  categories = catalogCategories.map(({ slug, title }) => ({ slug, name: title })),
}: Readonly<{ categories?: readonly CategoryDto[] }>) {
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const visibleCategories = catalogCategories.flatMap((category) => {
    const databaseCategory = categoriesBySlug.get(category.slug);
    return databaseCategory ? [{ ...category, title: databaseCategory.name }] : [];
  });

  return (
    <section className="catalog-categories" aria-labelledby="catalog-categories-title">
      <h2 id="catalog-categories-title" className="sr-only">
        Категории каталога
      </h2>
      <div className="catalog-categories__grid">
        {visibleCategories.map((category) => (
          <Link
            key={category.href}
            className={`catalog-category catalog-category--${category.size}`}
            href={category.href}
          >
            <Image
              className="catalog-category__image"
              src={category.image}
              alt=""
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
            />
            <span className="catalog-category__shade" aria-hidden="true" />
            <span className="catalog-category__content">
              <span className="catalog-category__title">{category.title}</span>
              <span className="catalog-category__description">{category.description}</span>
              <span className="catalog-category__action">
                Смотреть коллекцию
                <ArrowRight aria-hidden="true" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
