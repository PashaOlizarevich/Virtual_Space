import type { Product } from "@/modules/catalog/types";

export const lumoTablewareProduct = {
  id: "lumo-plates",
  slug: "lumo-plates",
  name: "Набор тарелок Lumo",
  description: "Четыре керамические тарелки ручной работы с мягкой матовой глазурью.",
  price: 180,
  currency: "BYN",
  image: "/images/tableware/lumo-plates/01-main.png",
  imageAlt: "Четыре светлые керамические тарелки Lumo на каменной столешнице",
  gallery: [
    {
      src: "/images/tableware/lumo-plates/01-main.png",
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
  image: "/images/chairs/arco-chair/01-main.png",
  imageAlt: "Чёрный деревянный стул Arco",
  gallery: [{ src: "/images/chairs/arco-chair/01-main.png", alt: "Деревянный стул Arco" }],
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
  image: "/images/chairs/noma-chair/01-main.png",
  imageAlt: "Стул Noma из светлого дуба с плетёным сиденьем",
  gallery: [{ src: "/images/chairs/noma-chair/01-main.png", alt: "Дубовый стул Noma" }],
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
  image: "/images/chairs/tera-chair/01-main.png",
  imageAlt: "Мягкий серый стул Tera на тонком металлическом каркасе",
  gallery: [{ src: "/images/chairs/tera-chair/01-main.png", alt: "Стул Tera с шерстяной обивкой" }],
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
  image: "/images/sofas/lento-sofa/01-main.png",
  imageAlt: "Светлый двухместный диван Lento с округлыми подлокотниками",
  gallery: [
    { src: "/images/sofas/lento-sofa/01-main.png", alt: "Двухместный диван Lento" },
    { src: "/images/sofas/lento-sofa/02-side.png", alt: "Диван Lento, вид сбоку" },
    { src: "/images/sofas/lento-sofa/03-armrest.png", alt: "Подлокотник дивана Lento" },
    { src: "/images/sofas/lento-sofa/04-leg.png", alt: "Опора дивана Lento крупным планом" },
    { src: "/images/sofas/lento-sofa/05-top.png", alt: "Диван Lento, вид сверху" },
    { src: "/images/sofas/lento-sofa/06-unfolded.png", alt: "Диван Lento в разложенном виде" },
    { src: "/images/sofas/lento-sofa/07-main.png", alt: "Диван Lento, дополнительный общий вид" },
  ],
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
  image: "/images/sofas/vela-sofa/01-main.png",
  imageAlt: "Серо-зелёный трёхместный диван Vela с плавной спинкой",
  gallery: [{ src: "/images/sofas/vela-sofa/01-main.png", alt: "Трёхместный диван Vela" }],
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
  image: "/images/sofas/nord-sofa/01-main.png",
  imageAlt: "Светло-серый модульный диван Nord с шезлонгом справа",
  gallery: [
    { src: "/images/sofas/nord-sofa/01-main.png", alt: "Модульный диван Nord с шезлонгом" },
  ],
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
  image: "/images/sofas/aura-sofa/01-main.png",
  imageAlt: "Коричневый трёхместный диван Aura с округлой спинкой",
  gallery: [
    { src: "/images/sofas/aura-sofa/01-main.png", alt: "Скульптурный диван Aura" },
    { src: "/images/sofas/aura-sofa/02-side.png", alt: "Диван Aura, вид сбоку" },
    { src: "/images/sofas/aura-sofa/03-armrest.png", alt: "Подлокотник дивана Aura" },
    { src: "/images/sofas/aura-sofa/04-leg.png", alt: "Опора дивана Aura крупным планом" },
    { src: "/images/sofas/aura-sofa/05-top.png", alt: "Диван Aura, вид сверху" },
    { src: "/images/sofas/aura-sofa/06-unfolded.png", alt: "Диван Aura в разложенном виде" },
    { src: "/images/sofas/aura-sofa/07-main.png", alt: "Диван Aura, дополнительный общий вид" },
  ],
  specifications: [
    { label: "Размер", value: "246 × 102 × 73 см" },
    { label: "Основание", value: "Массив ореха" },
    { label: "Обивка", value: "Фактурный шенилл" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const nubiBedProduct = {
  id: "nubi-bed",
  slug: "nubi-bed",
  name: "Кровать Nubi",
  description: "Мягкая кровать с округлым изголовьем и просторным спальным местом.",
  price: 1690,
  currency: "BYN",
  image: "/images/beds/nubi-bed/01-main.png",
  imageAlt: "Светлая кровать Nubi с округлым мягким изголовьем",
  gallery: [{ src: "/images/beds/nubi-bed/01-main.png", alt: "Кровать Nubi в светлой спальне" }],
  specifications: [
    { label: "Размер", value: "168 × 218 × 112 см" },
    { label: "Спальное место", value: "160 × 200 см" },
    { label: "Обивка", value: "Фактурное букле" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const ardeaBedProduct = {
  id: "ardea-bed",
  slug: "ardea-bed",
  name: "Кровать Ardea",
  description: "Кровать с мягким изголовьем и основанием из натурального дуба.",
  price: 1790,
  currency: "BYN",
  image: "/images/beds/ardea-bed/01-main.png",
  imageAlt: "Дубовая кровать Ardea с мягким серым изголовьем",
  gallery: [
    {
      src: "/images/beds/ardea-bed/01-main.png",
      alt: "Кровать Ardea в спальне с естественным светом",
    },
  ],
  specifications: [
    { label: "Размер", value: "188 × 218 × 118 см" },
    { label: "Спальное место", value: "180 × 200 см" },
    { label: "Материал", value: "Массив дуба, ткань" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const lineaBedProduct = {
  id: "linea-bed",
  slug: "linea-bed",
  name: "Кровать Linea",
  description: "Лаконичная кровать с чистыми линиями и низким профилем.",
  price: 1590,
  currency: "BYN",
  image: "/images/beds/linea-bed/01-main.png",
  imageAlt: "Низкая кровать Linea с бежевой обивкой и тонкими тёмными ножками",
  gallery: [
    {
      src: "/images/beds/linea-bed/01-main.png",
      alt: "Минималистичная кровать Linea в современной спальне",
    },
  ],
  specifications: [
    { label: "Размер", value: "168 × 216 × 94 см" },
    { label: "Спальное место", value: "160 × 200 см" },
    { label: "Основание", value: "Металл, берёзовые ламели" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const albaMattressProduct = {
  id: "alba-mattress",
  slug: "alba-mattress",
  name: "Матрас Alba",
  description: "Высокий матрас с упругой поддержкой и мягким стёганым верхним слоем.",
  price: 1890,
  currency: "BYN",
  image: "/images/mattresses/alba-mattress/01-main.png",
  imageAlt: "Белый матрас Alba с вертикальной стёжкой в светлой спальне",
  gallery: [
    { src: "/images/mattresses/alba-mattress/01-main.png", alt: "Матрас Alba в интерьере спальни" },
  ],
  specifications: [
    { label: "Размер", value: "160 × 200 см" },
    { label: "Высота", value: "28 см" },
    { label: "Жёсткость", value: "Средняя" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const formaMattressProduct = {
  id: "forma-mattress",
  slug: "forma-mattress",
  name: "Матрас Forma",
  description: "Сбалансированный матрас с адаптивной поверхностью для комфортного сна вдвоём.",
  price: 1690,
  currency: "BYN",
  image: "/images/mattresses/forma-mattress/01-main.png",
  imageAlt: "Белый матрас Forma с мягко скруглёнными углами в нейтральной спальне",
  gallery: [
    {
      src: "/images/mattresses/forma-mattress/01-main.png",
      alt: "Матрас Forma в интерьере спальни",
    },
  ],
  specifications: [
    { label: "Размер", value: "160 × 200 см" },
    { label: "Высота", value: "24 см" },
    { label: "Жёсткость", value: "Средняя" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const nomaMattressProduct = {
  id: "noma-mattress",
  slug: "noma-mattress",
  name: "Матрас Noma",
  description: "Анатомический матрас с усиленным контуром и выразительной геометричной стёжкой.",
  price: 1490,
  currency: "BYN",
  image: "/images/mattresses/noma-mattress/01-main.png",
  imageAlt: "Белый матрас Noma с контрастным кантом в современной спальне",
  gallery: [
    { src: "/images/mattresses/noma-mattress/01-main.png", alt: "Матрас Noma в интерьере спальни" },
  ],
  specifications: [
    { label: "Размер", value: "160 × 200 см" },
    { label: "Высота", value: "26 см" },
    { label: "Жёсткость", value: "Выше средней" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const linoThrowProduct = {
  id: "lino-throw",
  slug: "lino-throw",
  name: "Плед Lino",
  description:
    "Льняной плед с выразительным плетением и мягкой бахромой для спокойных интерьерных акцентов.",
  price: 289,
  currency: "BYN",
  image: "/images/textiles-decor/lino-throw/01-main.png",
  imageAlt: "Натуральный льняной плед Lino на светлом диване",
  gallery: [
    {
      src: "/images/textiles-decor/lino-throw/01-main.png",
      alt: "Плед Lino в интерьере гостиной",
    },
  ],
  specifications: [
    { label: "Размер", value: "140 × 200 см" },
    { label: "Материал", value: "100% лён" },
    { label: "Уход", value: "Деликатная стирка при 30 °C" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const miroCushionProduct = {
  id: "miro-cushion",
  slug: "miro-cushion",
  name: "Подушка Miro",
  description: "Декоративная подушка из хлопкового букле с рельефным узором и упругим наполнением.",
  price: 189,
  currency: "BYN",
  image: "/images/textiles-decor/miro-cushion/01-main.png",
  imageAlt: "Светлая декоративная подушка Miro с рельефным узором",
  gallery: [
    {
      src: "/images/textiles-decor/miro-cushion/01-main.png",
      alt: "Подушка Miro на светлом диване",
    },
  ],
  specifications: [
    { label: "Размер", value: "50 × 50 см" },
    { label: "Чехол", value: "Хлопковое букле" },
    { label: "Наполнитель", value: "Полиэфирное волокно" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const soraVaseProduct = {
  id: "sora-vase",
  slug: "sora-vase",
  name: "Ваза Sora",
  description:
    "Скульптурная керамическая ваза ручной работы с матовой фактурой и плавным силуэтом.",
  price: 159,
  currency: "BYN",
  image: "/images/textiles-decor/sora-vase/01-main.png",
  imageAlt: "Скульптурная белая керамическая ваза Sora",
  gallery: [
    {
      src: "/images/textiles-decor/sora-vase/01-main.png",
      alt: "Ваза Sora с сухими ветвями на дубовой консоли",
    },
  ],
  specifications: [
    { label: "Размер", value: "24 × 14 × 32 см" },
    { label: "Материал", value: "Керамика" },
    { label: "Отделка", value: "Матовая глазурь" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const tavolaDiningTableProduct = {
  id: "tavola-dining-table",
  slug: "tavola-dining-table",
  name: "Стол Tavola",
  description: "Прямоугольный обеденный стол из массива дуба с выразительной природной текстурой.",
  price: 2490,
  currency: "BYN",
  image: "/images/dining-tables/tavola-dining-table/01-main.png",
  imageAlt: "Прямоугольный обеденный стол Tavola из натурального дуба",
  gallery: [
    {
      src: "/images/dining-tables/tavola-dining-table/01-main.png",
      alt: "Дубовый обеденный стол Tavola в светлом интерьере",
    },
  ],
  specifications: [
    { label: "Размер", value: "200 × 95 × 75 см" },
    { label: "Материал", value: "Массив дуба" },
    { label: "Количество мест", value: "6–8" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const orbisDiningTableProduct = {
  id: "orbis-dining-table",
  slug: "orbis-dining-table",
  name: "Стол Orbis",
  description: "Круглый стол из тёмного ореха со скульптурным основанием для камерных встреч.",
  price: 2890,
  currency: "BYN",
  image: "/images/dining-tables/orbis-dining-table/01-main.png",
  imageAlt: "Круглый обеденный стол Orbis из тёмного ореха на центральном основании",
  gallery: [
    {
      src: "/images/dining-tables/orbis-dining-table/01-main.png",
      alt: "Ореховый обеденный стол Orbis в нейтральном интерьере",
    },
  ],
  specifications: [
    { label: "Размер", value: "Ø 130 × 75 см" },
    { label: "Материал", value: "Шпон американского ореха" },
    { label: "Количество мест", value: "4–6" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const elaraDiningTableProduct = {
  id: "elara-dining-table",
  slug: "elara-dining-table",
  name: "Стол Elara",
  description: "Овальный стол из светлого ясеня с мягким силуэтом и тонкими наклонными опорами.",
  price: 2690,
  currency: "BYN",
  image: "/images/dining-tables/elara-dining-table/01-main.png",
  imageAlt: "Овальный обеденный стол Elara из светлого ясеня",
  gallery: [
    {
      src: "/images/dining-tables/elara-dining-table/01-main.png",
      alt: "Светлый обеденный стол Elara в современном интерьере",
    },
  ],
  specifications: [
    { label: "Размер", value: "190 × 100 × 75 см" },
    { label: "Материал", value: "Массив и шпон ясеня" },
    { label: "Количество мест", value: "6" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const arloPoufProduct = {
  id: "arlo-pouf",
  slug: "arlo-pouf",
  name: "Пуф Arlo",
  description: "Мягкий круглый пуф из фактурного букле с устойчивыми ножками из массива дуба.",
  price: 650,
  currency: "BYN",
  image: "/images/poufs/arlo-pouf/01-main.png",
  imageAlt: "Круглый пуф Arlo в светлой обивке букле на деревянных ножках",
  gallery: [
    {
      src: "/images/poufs/arlo-pouf/01-main.png",
      alt: "Светлый круглый пуф Arlo из фактурного букле",
    },
  ],
  specifications: [
    { label: "Размер", value: "Ø 62 × 46 см" },
    { label: "Обивка", value: "Фактурное букле" },
    { label: "Опоры", value: "Массив дуба" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const nolaPoufProduct = {
  id: "nola-pouf",
  slug: "nola-pouf",
  name: "Пуф Nola",
  description: "Цилиндрический пуф с бархатистой обивкой и низким основанием из тёмного ореха.",
  price: 720,
  currency: "BYN",
  image: "/images/poufs/nola-pouf/01-main.png",
  imageAlt: "Оливковый цилиндрический пуф Nola на основании из тёмного ореха",
  gallery: [
    {
      src: "/images/poufs/nola-pouf/01-main.png",
      alt: "Пуф Nola в оливковой обивке с деревянным основанием",
    },
  ],
  specifications: [
    { label: "Размер", value: "Ø 54 × 48 см" },
    { label: "Обивка", value: "Мебельный велюр" },
    { label: "Основание", value: "Шпон ореха" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const taroPoufProduct = {
  id: "taro-pouf",
  slug: "taro-pouf",
  name: "Пуф Taro",
  description: "Лаконичный пуф-куб с мягкими гранями и практичной износостойкой обивкой.",
  price: 580,
  currency: "BYN",
  image: "/images/poufs/taro-pouf/01-main.png",
  imageAlt: "Квадратный пуф Taro в тёплой светло-бежевой тканевой обивке",
  gallery: [
    {
      src: "/images/poufs/taro-pouf/01-main.png",
      alt: "Светлый кубический пуф Taro с мягкими гранями",
    },
  ],
  specifications: [
    { label: "Размер", value: "52 × 52 × 47 см" },
    { label: "Обивка", value: "Износостойкая рогожка" },
    { label: "Каркас", value: "Берёзовая фанера" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const asterArmchairProduct = {
  id: "aster-armchair",
  slug: "aster-armchair",
  name: "Кресло Aster",
  description: "Мягкое кресло в фактурном букле с обволакивающей спинкой и плавными линиями.",
  price: 1590,
  currency: "BYN",
  image: "/images/armchairs/aster-armchair/01-main.png",
  imageAlt: "Светлое кресло Aster в обивке из фактурного букле",
  gallery: [
    {
      src: "/images/armchairs/aster-armchair/01-main.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/02-three-quarter.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/03-armrest-detail.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/04-fabric-detail.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/05-side.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/06-base-detail.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/07-lifestyle.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/08-dimensions.png",
      alt: "Кресло Aster в светлом интерьере",
    },
    {
      src: "/images/armchairs/aster-armchair/09-interior.png",
      alt: "Кресло Aster в светлом интерьере",
    },
  ],
  specifications: [
    { label: "Размер", value: "84 × 88 × 82 см" },
    { label: "Обивка", value: "Фактурное букле" },
    { label: "Опоры", value: "Сталь с матовым покрытием" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const runaArmchairProduct = {
  id: "runa-armchair",
  slug: "runa-armchair",
  name: "Кресло Runa",
  description: "Глубокое кресло в шерстяной ткани с тёплым основанием из массива ореха.",
  price: 1890,
  currency: "BYN",
  image: "/images/armchairs/runa-armchair/01-main.png",
  imageAlt: "Оливковое кресло Runa на основании из тёплого ореха",
  gallery: [
    {
      src: "/images/armchairs/runa-armchair/01-main.png",
      alt: "Кресло Runa в оливковой обивке",
    },
  ],
  specifications: [
    { label: "Размер", value: "91 × 94 × 79 см" },
    { label: "Обивка", value: "Шерстяная ткань" },
    { label: "Основание", value: "Массив ореха" },
  ],
  optionGroups: [],
} as const satisfies Product;

export const veroArmchairProduct = {
  id: "vero-armchair",
  slug: "vero-armchair",
  name: "Кресло Vero",
  description: "Компактное поворотное кресло с цельным округлым силуэтом и мягкой поддержкой.",
  price: 1690,
  currency: "BYN",
  image: "/images/armchairs/vero-armchair/01-main.png",
  imageAlt: "Округлое кресло Vero в тёплой бежевой обивке на поворотном основании",
  gallery: [
    {
      src: "/images/armchairs/vero-armchair/01-main.png",
      alt: "Поворотное кресло Vero в нейтральном интерьере",
    },
  ],
  specifications: [
    { label: "Размер", value: "82 × 84 × 75 см" },
    { label: "Обивка", value: "Мебельный шенилл" },
    { label: "Механизм", value: "Поворотное основание" },
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
    image: "/images/armchairs/forma-armchair/01-main.png",
    imageAlt: "Светлое кресло Forma из фактурной ткани",
    gallery: [
      { src: "/images/armchairs/forma-armchair/01-main.png", alt: "Кресло Forma, вид спереди" },
      {
        src: "/images/armchairs/forma-armchair/02-three-quarter.png",
        alt: "Кресло Forma, вид спереди",
      },
      { src: "/images/armchairs/forma-armchair/03-armrest.png", alt: "Кресло Forma, вид спереди" },
      { src: "/images/armchairs/forma-armchair/04-fabric.png", alt: "Кресло Forma, вид спереди" },
      { src: "/images/armchairs/forma-armchair/05-side.png", alt: "Кресло Forma, вид спереди" },
      { src: "/images/armchairs/forma-armchair/06-leg.png", alt: "Кресло Forma, вид спереди" },
      { src: "/images/armchairs/forma-armchair/07-top.png", alt: "Кресло Forma, вид спереди" },
      {
        src: "/images/armchairs/forma-armchair/08-dimensions.png",
        alt: "Кресло Forma, вид спереди",
      },
      { src: "/images/armchairs/forma-armchair/09-interior.png", alt: "Кресло Forma, вид спереди" },
    ],
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
    image: "/images/sofas/modul-sofa/01-main.png",
    imageAlt: "Светлый трёхместный диван Modul",
    gallery: [
      { src: "/images/sofas/modul-sofa/01-main.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/02-side.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/03-armrest.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/04-leg.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/05-top.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/06-unfolded.png", alt: "Трёхместный диван Modul" },
      { src: "/images/sofas/modul-sofa/07-main.png", alt: "Трёхместный диван Modul" },
    ],
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
    image: "/images/dining-tables/linea-table/01-main.png",
    imageAlt: "Прямоугольный дубовый стол Linea",
    gallery: [
      { src: "/images/dining-tables/linea-table/01-main.png", alt: "Обеденный стол Linea" },
    ],
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

export const bedCategoryProducts = [
  nubiBedProduct,
  ardeaBedProduct,
  lineaBedProduct,
] as const satisfies readonly Product[];

export const mattressCategoryProducts = [
  albaMattressProduct,
  formaMattressProduct,
  nomaMattressProduct,
] as const satisfies readonly Product[];

export const textilesDecorCategoryProducts = [
  linoThrowProduct,
  miroCushionProduct,
  soraVaseProduct,
] as const satisfies readonly Product[];

export const diningTableCategoryProducts = [
  tavolaDiningTableProduct,
  orbisDiningTableProduct,
  elaraDiningTableProduct,
] as const satisfies readonly Product[];

export const poufCategoryProducts = [
  arloPoufProduct,
  nolaPoufProduct,
  taroPoufProduct,
] as const satisfies readonly Product[];

export const armchairCategoryProducts = [
  products[0],
  asterArmchairProduct,
  runaArmchairProduct,
  veroArmchairProduct,
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
  ...bedCategoryProducts,
  ...mattressCategoryProducts,
  ...textilesDecorCategoryProducts,
  ...diningTableCategoryProducts,
  ...poufCategoryProducts,
  ...armchairCategoryProducts,
] as const satisfies readonly Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}
