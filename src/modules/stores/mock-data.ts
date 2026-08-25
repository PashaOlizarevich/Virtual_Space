import type { StoreLocation } from "@/modules/stores/types";

export const stores = [
  {
    city: "Нью-Йорк",
    address: "150 Greene Street, New York, NY 10012, USA",
    hours: "Ежедневно 10:00–21:00",
    description:
      "Первое пространство за пределами Европы. Лофт с высокими потолками и обилием естественного света подчёркивает фактуру дерева, камня и текстиля.",
    images: [
      {
        src: "/images/stores/new-york/01-facade.jpg",
        alt: "Фасад магазина Virtual Space в Нью-Йорке",
        label: "Фасад",
      },
      {
        src: "/images/stores/new-york/02-interior.jpg",
        alt: "Общий вид магазина Virtual Space в Нью-Йорке",
        label: "Интерьер",
      },
      {
        src: "/images/stores/new-york/03-reception.jpg",
        alt: "Ресепшен магазина Virtual Space в Нью-Йорке",
        label: "Ресепшен",
      },
      {
        src: "/images/stores/new-york/04-detail.jpg",
        alt: "Интерьерная деталь магазина Virtual Space в Нью-Йорке",
        label: "Детали",
      },
    ],
  },
  {
    city: "Москва",
    address: "ул. Тимура Фрунзе, 11, Москва, 119021, Россия",
    hours: "Ежедневно 10:00–21:00",
    description:
      "Тихий переулок Хамовников и историческое здание XIX века. Спокойные интерьеры с натуральным камнем и дубом располагают к неспешному выбору.",
    images: [
      {
        src: "/images/stores/moscow/02-interior.jpg",
        alt: "Общий вид магазина Virtual Space в Москве",
        label: "Интерьер",
      },
      {
        src: "/images/stores/moscow/01-facade.jpg",
        alt: "Фасад магазина Virtual Space в Москве",
        label: "Фасад",
      },
      {
        src: "/images/stores/moscow/03-reception.jpg",
        alt: "Ресепшен магазина Virtual Space в Москве",
        label: "Ресепшен",
      },
      {
        src: "/images/stores/moscow/04-detail.jpg",
        alt: "Интерьерная деталь магазина Virtual Space в Москве",
        label: "Детали",
      },
    ],
  },
  {
    city: "Минск",
    address: "ул. Сурганова, 57Б, Минск, 220073, Беларусь",
    hours: "Ежедневно 11:00–20:00",
    description:
      "Современное пространство в деловом районе города. Чистые линии, тёплый дуб и приглушённый свет соединяют функциональность и домашний комфорт.",
    images: [
      {
        src: "/images/stores/minsk/01-facade.jpg",
        alt: "Фасад магазина Virtual Space в Минске",
        label: "Фасад",
      },
      {
        src: "/images/stores/minsk/02-interior.jpg",
        alt: "Общий вид магазина Virtual Space в Минске",
        label: "Интерьер",
      },
      {
        src: "/images/stores/minsk/03-reception.jpg",
        alt: "Ресепшен магазина Virtual Space в Минске",
        label: "Ресепшен",
      },
      {
        src: "/images/stores/minsk/04-detail.jpg",
        alt: "Интерьерная деталь магазина Virtual Space в Минске",
        label: "Детали",
      },
    ],
  },
  {
    city: "Париж",
    address: "71 Rue de Turenne, 75003 Paris, France",
    hours: "Ежедневно 11:00–20:00",
    description:
      "Пространство в Маре объединяет французскую сдержанность и натуральные материалы. Высокие своды и старый камень становятся частью экспозиции.",
    images: [
      {
        src: "/images/stores/paris/02-interior.jpg",
        alt: "Общий вид магазина Virtual Space в Париже",
        label: "Интерьер",
      },
      {
        src: "/images/stores/paris/01-facade.jpg",
        alt: "Фасад магазина Virtual Space в Париже",
        label: "Фасад",
      },
      {
        src: "/images/stores/paris/03-reception.jpg",
        alt: "Ресепшен магазина Virtual Space в Париже",
        label: "Ресепшен",
      },
      {
        src: "/images/stores/paris/04-detail.jpg",
        alt: "Интерьерная деталь магазина Virtual Space в Париже",
        label: "Детали",
      },
    ],
  },
] as const satisfies readonly StoreLocation[];
