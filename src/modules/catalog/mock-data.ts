import type { Product } from "@/modules/catalog/types";

export const lumoTablewareProduct = {
  id: "lumo-plates",
  slug: "lumo-plates",
  name: "Набор тарелок Lumo",
  description: "Четыре керамические тарелки ручной работы с мягкой матовой глазурью.",
  price: 180,
  currency: "BYN",
  image: "/images/tableware/lumo-plates.png",
  imageAlt: "Четыре светлые керамические тарелки Lumo на каменной столешнице",
  gallery: [
    {
      src: "/images/tableware/lumo-plates.png",
      alt: "Набор из четырёх керамических тарелок Lumo",
    },
  ],
  specifications: [
    { label: "Комплектация", value: "4 тарелки" },
    { label: "Материал", value: "Керамика" },
    { label: "Покрытие", value: "Матовая глазурь" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const arcoChairProduct = {
  id: "arco-chair",
  slug: "arco-chair",
  name: "Стул Arco",
  description: "Лёгкий стул из ясеня с выразительной изогнутой спинкой.",
  price: 590,
  currency: "BYN",
  image: "/images/home/arco.png",
  imageAlt: "Чёрный деревянный стул Arco",
  gallery: [{ src: "/images/home/arco.png", alt: "Деревянный стул Arco" }],
  specifications: [
    { label: "Размер", value: "48 × 52 × 79 см" },
    { label: "Материал", value: "Массив ясеня" },
    { label: "Высота сиденья", value: "46 см" },
  ],
  optionGroups: [
    {
      id: "finish",
      label: "Отделка",
      options: [
        { id: "black", label: "Чёрная эмаль" },
        { id: "natural", label: "Натуральное масло" },
      ],
    },
  ],
} as const satisfies Product;

export const nomaChairProduct = {
  id: "noma-chair",
  slug: "noma-chair",
  name: "Стул Noma",
  description: "Обеденный стул из светлого дуба с плетёным сиденьем.",
  price: 720,
  currency: "BYN",
  image: "/images/chairs/noma.png",
  imageAlt: "Стул Noma из светлого дуба с плетёным сиденьем",
  gallery: [{ src: "/images/chairs/noma.png", alt: "Дубовый стул Noma" }],
  specifications: [
    { label: "Размер", value: "49 × 54 × 80 см" },
    { label: "Материал", value: "Массив дуба, бумажный шнур" },
    { label: "Высота сиденья", value: "46 см" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const teraChairProduct = {
  id: "tera-chair",
  slug: "tera-chair",
  name: "Стул Tera",
  description: "Мягкий стул с тонким металлическим каркасом и шерстяной обивкой.",
  price: 840,
  currency: "BYN",
  image: "/images/chairs/tera.png",
  imageAlt: "Мягкий серый стул Tera на тонком металлическом каркасе",
  gallery: [{ src: "/images/chairs/tera.png", alt: "Стул Tera с шерстяной обивкой" }],
  specifications: [
    { label: "Размер", value: "54 × 58 × 78 см" },
    { label: "Каркас", value: "Сталь с порошковым покрытием" },
    { label: "Обивка", value: "Шерстяная ткань" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const lentoSofaProduct = {
  id: "lento-sofa",
  slug: "lento-sofa",
  name: "Диван Lento",
  description: "Компактный двухместный диван с мягкими линиями и уютной глубокой посадкой.",
  price: 2590,
  currency: "BYN",
  image: "/images/sofas/lento.png",
  imageAlt: "Светлый двухместный диван Lento с округлыми подлокотниками",
  gallery: [{ src: "/images/sofas/lento.png", alt: "Двухместный диван Lento" }],
  specifications: [
    { label: "Размер", value: "184 × 94 × 76 см" },
    { label: "Каркас", value: "Берёзовая фанера, массив" },
    { label: "Обивка", value: "Фактурная рогожка" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const velaSofaProduct = {
  id: "vela-sofa",
  slug: "vela-sofa",
  name: "Диван Vela",
  description: "Трёхместный диван с плавной спинкой и спокойной фактурой для современной гостиной.",
  price: 3490,
  currency: "BYN",
  image: "/images/sofas/vela.png",
  imageAlt: "Серо-зелёный трёхместный диван Vela с плавной спинкой",
  gallery: [{ src: "/images/sofas/vela.png", alt: "Трёхместный диван Vela" }],
  specifications: [
    { label: "Размер", value: "228 × 96 × 78 см" },
    { label: "Основание", value: "Массив бука" },
    { label: "Обивка", value: "Шенилл" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const nordSofaProduct = {
  id: "nord-sofa",
  slug: "nord-sofa",
  name: "Диван Nord",
  description: "Просторная модульная композиция с шезлонгом и глубокими мягкими подушками.",
  price: 4690,
  currency: "BYN",
  image: "/images/sofas/nord.png",
  imageAlt: "Светло-серый модульный диван Nord с шезлонгом справа",
  gallery: [{ src: "/images/sofas/nord.png", alt: "Модульный диван Nord с шезлонгом" }],
  specifications: [
    { label: "Размер", value: "284 × 164 × 74 см" },
    { label: "Модули", value: "3 секции" },
    { label: "Обивка", value: "Льняная ткань" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const auraSofaProduct = {
  id: "aura-sofa",
  slug: "aura-sofa",
  name: "Диван Aura",
  description: "Скульптурный диван с обволакивающей спинкой и тёплой тактильной обивкой.",
  price: 4290,
  currency: "BYN",
  image: "/images/sofas/aura.png",
  imageAlt: "Коричневый трёхместный диван Aura с округлой спинкой",
  gallery: [{ src: "/images/sofas/aura.png", alt: "Скульптурный диван Aura" }],
  specifications: [
    { label: "Размер", value: "246 × 102 × 73 см" },
    { label: "Основание", value: "Массив ореха" },
    { label: "Обивка", value: "Фактурный шенилл" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const products = [
  {
    id: "forma-chair",
    slug: "forma-chair",
    name: "Кресло Forma",
    description: "Объёмное кресло с мягкими линиями и уютной посадкой.",
    price: 1390,
    currency: "BYN",
    image: "/images/home/forma.png",
    imageAlt: "Светлое кресло Forma из фактурной ткани",
    gallery: [{ src: "/images/home/forma.png", alt: "Кресло Forma, вид спереди" }],
    specifications: [
      { label: "Размер", value: "86 × 92 × 74 см" },
      { label: "Каркас", value: "Берёзовая фанера, массив" },
      { label: "Наполнение", value: "Пенополиуретан разной плотности" },
    ],
    optionGroups: [
      {
        id: "upholstery",
        label: "Обивка",
        options: [
          { id: "boucle", label: "Букле" },
          { id: "velour", label: "Велюр" },
        ],
      },
      {
        id: "color",
        label: "Цвет",
        options: [
          { id: "milk", label: "Молочный" },
          { id: "sand", label: "Песочный" },
        ],
      },
    ],
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
    gallery: [{ src: "/images/home/modul.png", alt: "Трёхместный диван Modul" }],
    specifications: [
      { label: "Размер", value: "240 × 98 × 72 см" },
      { label: "Модули", value: "3 секции" },
      { label: "Наполнение", value: "Пенополиуретан, холлофайбер" },
    ],
    optionGroups: [
      {
        id: "upholstery",
        label: "Обивка",
        options: [
          { id: "chenille", label: "Шенилл" },
          { id: "boucle", label: "Букле" },
        ],
      },
      {
        id: "color",
        label: "Цвет",
        options: [
          { id: "ivory", label: "Слоновая кость" },
          { id: "graphite", label: "Графит" },
        ],
      },
    ],
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
    gallery: [{ src: "/images/home/linea.png", alt: "Обеденный стол Linea" }],
    specifications: [
      { label: "Размер", value: "180 × 90 × 75 см" },
      { label: "Материал", value: "Массив дуба" },
      { label: "Количество мест", value: "6" },
    ],
    optionGroups: [
      {
        id: "finish",
        label: "Отделка",
        options: [
          { id: "natural", label: "Натуральное масло" },
          { id: "smoked", label: "Тонированное масло" },
        ],
      },
    ],
  },
  arcoChairProduct,
] as const satisfies readonly Product[];

export const featuredProducts = products;

export const chairCategoryProducts = [
  arcoChairProduct,
  nomaChairProduct,
  teraChairProduct,
] as const satisfies readonly Product[];

export const sofaCategoryProducts = [
  products[1],
  lentoSofaProduct,
  velaSofaProduct,
  nordSofaProduct,
  auraSofaProduct,
] as const satisfies readonly Product[];

export const allProducts = [
  ...products,
  lumoTablewareProduct,
  nomaChairProduct,
  teraChairProduct,
  lentoSofaProduct,
  velaSofaProduct,
  nordSofaProduct,
  auraSofaProduct,
] as const satisfies readonly Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}
