import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { storeProfile } from "@/modules/settings/mock-data";

export const metadata: Metadata = {
  title: "О нас — Virtual Space",
  description: "О Virtual Space, нашем подходе к мебели, шоуруме и способах связаться с нами.",
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <Container className="about-hero">
        <div className="about-hero__content">
          <h1>Пространство для жизни</h1>
          <p>{storeProfile.description}</p>
          <p>
            Наш выбор — предметы, которые легко вписываются в дом и остаются актуальными долгие
            годы.
          </p>
        </div>
        <div className="about-hero__media">
          <Image
            src="/images/home/hero-v2.png"
            alt="Светлая гостиная с мебелью из натуральных материалов"
            fill
            priority
            sizes="(min-width: 900px) 58vw, 100vw"
          />
        </div>
      </Container>

      <Container>
        <section className="about-story" aria-labelledby="about-story-title">
          <h2 id="about-story-title">Мебель, которая остаётся с вами</h2>
          <div className="about-story__copy">
            <p>
              Мы тщательно отбираем бренды и коллекции, проверяя качество, эргономику и уместность в
              реальной жизни. В нашем ассортименте — мебель, свет и аксессуары для спокойных и
              гармоничных интерьеров без лишнего.
            </p>
            <p>
              Мы верим в долговечность: надёжные материалы, продуманные конструкции и нейтральная
              эстетика служат годами. Наши консультанты помогут подобрать решение под ваш дом и
              образ жизни — внимательно и без спешки.
            </p>
          </div>
        </section>
      </Container>

      <section className="about-contact" aria-labelledby="about-contact-title">
        <Container className="about-contact__layout">
          <h2 id="about-contact-title">Приходите знакомиться</h2>
          <address className="about-contact__details">
            {storeProfile.contacts.map((contact) => (
              <div className="about-contact__item" key={contact.label}>
                <span>{contact.label}</span>
                {contact.href ? <a href={contact.href}>{contact.value}</a> : <p>{contact.value}</p>}
              </div>
            ))}
            <div className="about-contact__item">
              <span>Мы в соцсетях</span>
              <ul className="about-contact__socials">
                {storeProfile.socials.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} target="_blank" rel="noreferrer">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </address>
        </Container>
      </section>
    </main>
  );
}
