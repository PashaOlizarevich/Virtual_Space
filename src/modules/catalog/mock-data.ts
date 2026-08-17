import type { ProductPreview } from "@/modules/catalog/types";

export const featuredProducts = [
  {
    id: "forma-chair",
    slug: "forma-chair",
    name: "Кресло Forma",
    description: "Объёмное кресло с мягкими линиями и уютной посадкой.",
    price: 1390,
    currency: "BYN",
    image: "/images/home/forma.png",
    imageAlt: "Светлое кресло Forma из фактурной ткани",
  },
  {
    id: "modul-sofa",
    slug: "modul-sofa",
    name: "Диван Modul",
    description: "Модульный диван для гибких композиций и ежедневного комфорта.",
    price: 3990,
    currency: "BYN",
    image: "/images/home/modul.png",
    imageAlt: "Светлый трёхместный диван Modul",
  },
  {
    id: "linea-table",
    slug: "linea-table",
    name: "Стол Linea",
    description: "Лаконичный обеденный стол из натурального дуба.",
    price: 1890,
    currency: "BYN",
    image: "/images/home/linea.png",
    imageAlt: "Прямоугольный дубовый стол Linea",
  },
  {
    id: "arco-chair",
    slug: "arco-chair",
    name: "Стул Arco",
    description: "Лёгкий стул из ясеня с выразительной изогнутой спинкой.",
    price: 590,
    currency: "BYN",
    image: "/images/home/arco.png",
    imageAlt: "Чёрный деревянный стул Arco",
  },
] as const satisfies readonly ProductPreview[];
