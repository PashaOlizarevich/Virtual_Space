import { AdminShell } from "@/modules/admin/components/admin-shell";

export function AdminDashboard({
  data,
}: {
  data: { products: number; activeProducts: number; outOfStock: number };
}) {
  const metrics = [
    {
      id: "products",
      label: "Всего товаров",
      value: data.products,
      description: "Записей в PostgreSQL",
    },
    {
      id: "active",
      label: "Опубликовано",
      value: data.activeProducts,
      description: "Доступны в каталоге",
    },
    {
      id: "stock",
      label: "Нет в наличии",
      value: data.outOfStock,
      description: "Требуют пополнения",
    },
  ];
  return (
    <AdminShell active="dashboard">
      <main className="admin-dashboard">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Dashboard</p>
            <h1>Добро пожаловать</h1>
            <p>Сводка по магазину и последним действиям.</p>
          </div>
        </header>

        <section className="admin-dashboard__metrics" aria-labelledby="admin-metrics-title">
          <h2 className="sr-only" id="admin-metrics-title">
            Основные показатели
          </h2>
          {metrics.map((metric) => (
            <article className="admin-metric" key={metric.id}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.description}</span>
            </article>
          ))}
        </section>

        <section className="admin-activity" aria-labelledby="admin-activity-title">
          <div className="admin-activity__heading">
            <div>
              <p className="text-label-caps text-secondary">Состояние</p>
              <h2 id="admin-activity-title">Каталог подключён</h2>
            </div>
            <p>Показатели рассчитаны по актуальным данным PostgreSQL.</p>
          </div>
          <p>Управление товарами и настройками доступно через навигацию.</p>
        </section>
      </main>
    </AdminShell>
  );
}
