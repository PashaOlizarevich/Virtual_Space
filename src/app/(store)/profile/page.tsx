import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { ProfileDashboard } from "@/modules/users/components/profile-dashboard";
import { previewOrders, previewProfile } from "@/modules/users/mock-data";

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
          <h1>Здравствуйте, Анна</h1>
          <p>Управляйте контактами, возвращайтесь к текущему выбору и следите за заказами.</p>
        </header>
        <aside className="profile-preview-notice" aria-label="Режим предварительного просмотра">
          Профиль открыт в демонстрационном режиме. Авторизация и серверное хранение будут
          подключены на backend-этапе.
        </aside>
        <ProfileDashboard profile={previewProfile} orders={previewOrders} />
      </Container>
    </main>
  );
}
