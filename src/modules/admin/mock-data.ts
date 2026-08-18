import type { AdminDashboardData } from "@/modules/admin/types";
import type { AdminProduct } from "@/modules/admin/types";
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
  description: product.description,
  price: product.price,
  stock: [7, 3, 12, 0][index] ?? 0,
  published: index !== 3,
  images: product.gallery.map((image, imageIndex) => ({
    id: `${product.id}-${imageIndex}`,
    src: image.src,
    alt: image.alt,
    name: image.src.split("/").at(-1) ?? "Изображение товара",
  })),
}));
