import type {
  AdminDashboardData,
  AdminOrder,
  AdminProduct,
  AdminStoreSettings,
} from "@/modules/admin/types";
import { products } from "@/modules/catalog/mock-data";

export const adminDashboardPreview: AdminDashboardData = {
  metrics: [
    {
      id: "orders",
      label: "Новые заказы",
      value: "12",
      description: "Требуют обработки",
    },
    {
      id: "products",
      label: "Товары",
      value: "48",
      description: "В демонстрационном каталоге",
    },
    {
      id: "revenue",
      label: "Заявки за месяц",
      value: "86",
      description: "Предварительные данные",
    },
  ],
  activity: [
    {
      id: "activity-1",
      title: "Поступила новая заявка",
      description: "Заказ VS-1042 ожидает обработки",
      time: "10 минут назад",
    },
    {
      id: "activity-2",
      title: "Обновлён каталог",
      description: "Изменена карточка модульного дивана",
      time: "2 часа назад",
    },
    {
      id: "activity-3",
      title: "Изменены контакты",
      description: "Обновлён телефон магазина",
      time: "Вчера",
    },
  ],
};

export const adminProductsPreview: AdminProduct[] = products.map((product, index) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  category: index < 2 ? "Мягкая мебель" : "Столы и стулья",
  categoryId: String(index + 1),
  description: product.description,
  price: product.price,
  stock: [7, 3, 12, 0][index] ?? 0,
  published: index !== 3,
  material: "Не указан",
  style: "Современный",
  dimensions: "Не указаны",
  newFrom: null,
  newUntil: null,
  images: product.gallery.map((image, imageIndex) => ({
    id: `${product.id}-${imageIndex}`,
    src: image.src,
    alt: image.alt,
    name: image.src.split("/").at(-1) ?? "Изображение товара",
    position: imageIndex,
  })),
}));

export const adminOrdersPreview: AdminOrder[] = [
  {
    id: "VS-24042",
    createdAt: "2026-08-18T09:24:00+03:00",
    status: "new",
    customer: {
      name: "Анна Ковалёва",
      email: "anna@example.com",
      phone: "+375 29 123-45-67",
      comment: "Пожалуйста, позвоните перед доставкой.",
    },
    items: [
      {
        id: "item-24042-1",
        name: "Диван Forma",
        configuration: "Бежевый · 3 места",
        quantity: 1,
        unitPrice: 3120,
      },
      {
        id: "item-24042-2",
        name: "Столик Linea",
        configuration: "Дуб",
        quantity: 2,
        unitPrice: 420,
      },
    ],
    total: 3960,
  },
  {
    id: "VS-24031",
    createdAt: "2026-08-17T15:10:00+03:00",
    status: "confirmed",
    customer: { name: "Илья Морозов", email: "ilya@example.com", phone: "+375 44 765-43-21" },
    items: [
      {
        id: "item-24031-1",
        name: "Кресло Mono",
        configuration: "Графит",
        quantity: 2,
        unitPrice: 1240,
      },
    ],
    total: 2480,
  },
  {
    id: "VS-23998",
    createdAt: "2026-08-14T11:45:00+03:00",
    status: "completed",
    customer: { name: "Мария Соколова", email: "maria@example.com", phone: "+375 33 222-18-90" },
    items: [
      {
        id: "item-23998-1",
        name: "Стул Arc",
        configuration: "Чёрный ясень",
        quantity: 4,
        unitPrice: 380,
      },
    ],
    total: 1520,
  },
];

export const adminStoreSettingsPreview: AdminStoreSettings = {
  name: "Virtual Space",
  description:
    "Мы собираем мебель для спокойных, продуманных интерьеров — с честными материалами, ясными формами и вниманием к повседневной жизни.",
  phone: "+375 (29) 000-00-00",
  email: "hello@virtualspace.example",
  workingHours: "Пн–Пт: 10:00–19:00 · Сб–Вс: 11:00–17:00",
  address: "Минск, посещение по предварительной записи",
  instagram: "https://www.instagram.com/virtualspace",
  pinterest: "https://www.pinterest.com/virtualspace",
  telegram: "https://t.me/virtualspace",
};
