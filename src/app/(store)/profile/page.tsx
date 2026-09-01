import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProfileDashboard } from "@/modules/users/components/profile-dashboard";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Личные данные, текущая корзина и история заказов Virtual Space.",
};

export default function ProfilePage() {
  return (
    <main className="profile-page">
      <Container>
        <header className="profile-page__intro">
          <p className="text-label-caps text-secondary">Личный кабинет</p>
          <h1>Ваш личный кабинет</h1>
          <p>Управляйте контактами, возвращайтесь к текущему выбору и следите за заказами.</p>
        </header>
        <aside className="profile-preview-notice" aria-label="Хранение данных аккаунта">
          Личный кабинет больше не работает в демонстрационном режиме: сессия управляется Auth.js, а
          разделы «Контактная информация», «Корзина» и «Заказы» (включая статус «В работе»)
          загружаются из PostgreSQL.
        </aside>
        <ProfileDashboard />
      </Container>
    </main>
  );
}
