"use client";

import { Boxes, ClipboardList, LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { adminDashboardPreview } from "@/modules/admin/mock-data";
import { useAdminPreviewSession } from "@/modules/admin/session-provider";

const futureSections = [
  { label: "Товары", icon: Boxes },
  { label: "Заказы", icon: ClipboardList },
  { label: "Настройки", icon: Settings },
];

export function AdminDashboard() {
  const session = useAdminPreviewSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Навигация администратора">
        <Link className="admin-sidebar__brand" href="/" aria-label="Virtual Space — на главную">
          Virtual Space
        </Link>
        <nav>
          <ul className="admin-sidebar__navigation">
            <li>
              <Link className="admin-sidebar__link" href="/admin" aria-current="page">
                <LayoutDashboard aria-hidden="true" />
                Обзор
              </Link>
            </li>
            {futureSections.map(({ label, icon: Icon }) => (
              <li key={label}>
                <span
                  className="admin-sidebar__link admin-sidebar__link--disabled"
                  aria-disabled="true"
                >
                  <Icon aria-hidden="true" />
                  {label}
                  <span className="admin-sidebar__soon">Скоро</span>
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <Button className="admin-sidebar__logout" variant="ghost" onClick={session.signOut}>
          <LogOut data-icon="inline-start" aria-hidden="true" />
          Выйти
        </Button>
      </aside>

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
    </div>
  );
}
