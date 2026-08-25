import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { StoreSlider } from "@/modules/stores/components/store-slider";
import { stores } from "@/modules/stores/mock-data";

export const metadata: Metadata = {
  title: "Магазины",
  description: "Магазины мебели Virtual Space в Нью-Йорке, Москве, Минске и Париже.",
};

export default function StoresPage() {
  return (
    <main id="main-content" className="stores-page">
      <Container>
        <section className="stores-intro" aria-labelledby="stores-title">
          <h1 id="stores-title">Наши магазины</h1>
          <p>
            Virtual Space начинался с небольшой мастерской и идеи создавать мебель, которая служит
            долго и не теряет актуальности. Сегодня наши пространства открыты в четырёх городах —
            Нью-Йорке, Москве, Минске и Париже. Здесь можно почувствовать материалы, оценить
            пропорции и спокойно подобрать решения для дома.
          </p>
        </section>

        <section className="stores-list" aria-label="Адреса и фотографии магазинов">
          {stores.map((store, index) => (
            <StoreSlider store={store} storeNumber={index + 1} key={store.city} />
          ))}
        </section>

        <section className="stores-visit" aria-labelledby="stores-visit-title">
          <h2 id="stores-visit-title">Приходите в гости</h2>
          <div>
            <p>
              Покажем коллекции, поможем с подбором и обсудим индивидуальные решения для вашего
              интерьера. Выберите ближайший магазин и запланируйте визит.
            </p>
            <Link href="/about#about-contact-title">Все контакты</Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
