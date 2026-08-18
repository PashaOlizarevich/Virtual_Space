"use client";

import { AdminShell } from "@/modules/admin/components/admin-shell";
import { adminDashboardPreview } from "@/modules/admin/mock-data";

export function AdminDashboard() {
  return (
    <AdminShell active="dashboard">
      <main className="admin-dashboard">
        <header className="admin-dashboard__header">
          <div>
            <p className="text-label-caps text-secondary">Dashboard</p>
            <h1>Добро пожаловать</h1>
            <p>Сводка по магазину и последним действиям.</p>
          </div>
          <span className="admin-dashboard__preview">Демонстрационные данные</span>
        </header>

        <section className="admin-dashboard__metrics" aria-labelledby="admin-metrics-title">
          <h2 className="sr-only" id="admin-metrics-title">
            Основные показатели
          </h2>
          {adminDashboardPreview.metrics.map((metric) => (
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
              <p className="text-label-caps text-secondary">Обновления</p>
              <h2 id="admin-activity-title">Последняя активность</h2>
            </div>
            <p>События показаны для предварительного просмотра интерфейса.</p>
          </div>
          <ol className="admin-activity__list">
            {adminDashboardPreview.activity.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <time>{item.time}</time>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </AdminShell>
  );
}
