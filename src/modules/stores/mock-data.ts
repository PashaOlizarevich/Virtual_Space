import type { StoreLocation } from "@/modules/stores/types";

export const stores = [
  {
    city: "Нью-Йорк",
    address: "150 Greene Street, New York, NY 10012, USA",
    description:
      "Первое пространство за пределами Европы. Лофт с высокими потолками и обилием естественного света подчёркивает фактуру дерева, камня и текстиля.",
    images: [
      {
        src: "/images/home/hero-v2.png",
        alt: "Фасад магазина Virtual Space в Нью-Йорке",
        label: "Фасад",
      },
      {
        src: "/images/about/about-interior.png",
        alt: "Общий вид магазина Virtual Space в Нью-Йорке",
        label: "Интерьер",
      },
      {
        src: "/images/auth/login-interior.png",
        alt: "Ресепшен магазина Virtual Space в Нью-Йорке",
        label: "Ресепшен",
      },
      {
        src: "/images/sofas/lento-sofa/03-armrest.png",
        alt: "Интерьерная деталь магазина Virtual Space в Нью-Йорке",
        label: "Детали",
      },
    ],
  },
  {
    city: "Москва",
    address: "ул. Тимура Фрунзе, 11, Москва, 119021, Россия",
    description:
      "Тихий переулок Хамовников и историческое здание XIX века. Спокойные интерьеры с натуральным камнем и дубом располагают к неспешному выбору.",
    images: [
      {
        src: "/images/home/hero.png",
        alt: "Фасад магазина Virtual Space в Москве",
        label: "Фасад",
      },
      {
        src: "/images/sofas/aura-sofa/07-main.png",
        alt: "Общий вид магазина Virtual Space в Москве",
        label: "Интерьер",
      },
      {
        src: "/images/sofas/modul-sofa/07-main.png",
        alt: "Ресепшен магазина Virtual Space в Москве",
        label: "Ресепшен",
      },
      {
        src: "/images/sofas/aura-sofa/04-leg.png",
        alt: "Интерьерная деталь магазина Virtual Space в Москве",
        label: "Детали",
      },
    ],
  },
  {
    city: "Минск",
    address: "ул. Сурганова, 57Б, Минск, 220073, Беларусь",
    description:
      "Современное пространство в деловом районе города. Чистые линии, тёплый дуб и приглушённый свет соединяют функциональность и домашний комфорт.",
    images: [
      {
        src: "/images/sofas/modul-sofa/01-main.png",
        alt: "Фасад магазина Virtual Space в Минске",
        label: "Фасад",
      },
      {
        src: "/images/sofas/lento-sofa/07-main.png",
        alt: "Общий вид магазина Virtual Space в Минске",
        label: "Интерьер",
      },
      {
        src: "/images/dining-tables/tavola-dining-table/01-main.png",
        alt: "Ресепшен магазина Virtual Space в Минске",
        label: "Ресепшен",
      },
      {
        src: "/images/sofas/modul-sofa/03-armrest.png",
        alt: "Интерьерная деталь магазина Virtual Space в Минске",
        label: "Детали",
      },
    ],
  },
  {
    city: "Париж",
    address: "71 Rue de Turenne, 75003 Paris, France",
    description:
      "Пространство в Маре объединяет французскую сдержанность и натуральные материалы. Высокие своды и старый камень становятся частью экспозиции.",
    images: [
      {
        src: "/images/dining-tables/elara-dining-table/01-main.png",
        alt: "Фасад магазина Virtual Space в Париже",
        label: "Фасад",
      },
      {
        src: "/images/sofas/aura-sofa/01-main.png",
        alt: "Общий вид магазина Virtual Space в Париже",
        label: "Интерьер",
      },
      {
        src: "/images/dining-tables/orbis-dining-table/01-main.png",
        alt: "Ресепшен магазина Virtual Space в Париже",
        label: "Ресепшен",
      },
      {
        src: "/images/sofas/lento-sofa/04-leg.png",
        alt: "Интерьерная деталь магазина Virtual Space в Париже",
        label: "Детали",
      },
    ],
  },
] as const satisfies readonly StoreLocation[];
