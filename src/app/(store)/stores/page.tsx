import type { Metadata } from "next";
import Image from "next/image";
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
      <Container className="stores-hero">
        <div className="stores-hero__content">
          <h1>Пространства Virtual Space</h1>
          <p>
            Наши магазины — это больше, чем шоурумы. Здесь можно почувствовать материалы, оценить
            пропорции и увидеть, как свет меняет предметы и интерьер.
          </p>
        </div>
        <div className="stores-hero__media">
          <Image
            src="/images/home/hero-v2.png"
            alt="Светлый интерьер магазина Virtual Space с мебелью из натуральных материалов"
            fill
            preload
            loading="eager"
            sizes="(min-width: 900px) 66vw, 100vw"
          />
        </div>
      </Container>

      <Container>
        <section className="stores-story" aria-labelledby="stores-story-title">
          <div>
            <h2 id="stores-story-title">От мастерской к четырём городам</h2>
            <p className="stores-story__years">2018 — 2026</p>
          </div>
          <p>
            Мы начали с небольшой мастерской и идеи создавать мебель, которая служит долго и не
            теряет актуальности. Сегодня Virtual Space — это собственное производство и сеть
            пространств в четырёх городах.
          </p>
          <p>
            Каждый магазин отражает наш подход к материалам, вниманию к деталям и уважению к месту,
            в котором живёт предмет. Добро пожаловать знакомиться с коллекцией вживую.
          </p>
        </section>

        <section className="stores-list" aria-label="Адреса и фотографии магазинов">
          {stores.map((store) => (
            <StoreSlider store={store} key={store.city} />
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
