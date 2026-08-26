import type { Promotion } from "@/modules/promotions/types";

export const promotions = [
  {
    id: "quiet-form-2026",
    slug: "quiet-form",
    title: "Тихая форма. Новая цена.",
    description: "Избранные предметы для спокойного интерьера — со скидкой 20%.",
    startsAt: "2026-08-26T00:00:00.000Z",
    endsAt: "2026-09-15T23:59:59.999Z",
    productIds: ["forma-armchair", "linea-table", "lento-sofa", "riva-coffee-table"],
    discountPercent: 20,
    featured: true,
  },
  {
    id: "soft-details-2026",
    slug: "soft-details",
    title: "Мягкие детали",
    description: "Текстиль и небольшие предметы, которые завершают пространство.",
    startsAt: "2026-08-20T00:00:00.000Z",
    endsAt: "2026-09-05T23:59:59.999Z",
    productIds: ["lino-throw", "miro-cushion", "sora-vase"],
    discountPercent: 15,
    featured: false,
  },
] as const satisfies readonly Promotion[];
