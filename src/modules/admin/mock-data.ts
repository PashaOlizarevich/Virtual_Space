import type { AdminDashboardData } from "@/modules/admin/types";

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
