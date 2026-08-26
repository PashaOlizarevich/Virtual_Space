import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import { storeProfile } from "@/modules/settings/mock-data";

const companyLinks = [
  { href: "/about", label: "О нас" },
  { href: "/stores", label: "Магазины" },
  { href: "/about#contacts", label: "Контакты" },
] as const;

const customerInformation = [
  "Доставка",
  "Оплата",
  "Возврат",
  "Гарантия",
  "Политика конфиденциальности",
  "Обработка персональных данных",
] as const;

const orderedContacts = [
  storeProfile.contacts.find((contact) => contact.href?.startsWith("tel:")),
  storeProfile.contacts.find((contact) => contact.label === "Часы работы"),
  storeProfile.contacts.find((contact) => contact.href?.startsWith("mailto:")),
  storeProfile.contacts.find((contact) => !contact.href && contact.label !== "Часы работы"),
].filter((contact): contact is (typeof storeProfile.contacts)[number] => Boolean(contact));

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.7 3.5 2.9 10.4c-1.2.5-1.2 1.1-.2 1.4l4.6 1.4 1.7 5.3c.2.6.1.8.7.8.4 0 .7-.2.9-.4l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.2c.3-1.3-.5-1.9-1.3-1.7ZM9.1 12.9l8.9-5.6c.4-.3.8-.1.5.2l-7.3 6.6-.3 3.2-1.8-4.4Z" />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12.8 18.2C6.2 18.2 2.5 13.7 2.3 6h3.3c.1 5.7 2.6 8.1 4.6 8.6V6h3.1v4.9c2-.2 4.1-2.5 4.8-4.9h3.1c-.5 3-2.7 5.3-4.2 6.2 1.5.7 4 2.8 5 6h-3.4c-.8-2.3-2.7-4.1-5.3-4.4v4.4h-.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="site-footer__instagram" aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="site-footer__instagram-dot" cx="17.4" cy="6.7" r="1.1" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <nav className="site-footer__section" aria-labelledby="footer-company-heading">
            <h2 id="footer-company-heading">О компании</h2>
            <ul className="site-footer__list">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} prefetch={false}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer__section" aria-labelledby="footer-customers-heading">
            <h2 id="footer-customers-heading">Покупателям</h2>
            <ul className="site-footer__list">
              {customerInformation.map((item) => (
                <li key={item}>
                  <span className="site-footer__unavailable" aria-disabled="true">
                    {item}
                    <span className="sr-only"> — раздел готовится</span>
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <section className="site-footer__section" aria-labelledby="footer-contacts-heading">
            <h2 id="footer-contacts-heading">{storeProfile.name}</h2>
            <address className="site-footer__contacts">
              {orderedContacts.map((contact) => (
                <div className="site-footer__contact" key={contact.label}>
                  <span className="site-footer__contact-label">{contact.label}</span>
                  {contact.href ? (
                    <a href={contact.href}>{contact.value}</a>
                  ) : (
                    <span>{contact.value}</span>
                  )}
                </div>
              ))}
            </address>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-socials-heading">
            <h2 id="footer-socials-heading">Мы в социальных сетях</h2>
            <div className="site-footer__socials">
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Virtual Space в Telegram — откроется в новой вкладке"
              >
                <TelegramIcon />
              </a>
              <a
                href="https://vk.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Virtual Space во ВКонтакте — откроется в новой вкладке"
              >
                <VkIcon />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Virtual Space в Instagram — откроется в новой вкладке"
              >
                <InstagramIcon />
              </a>
            </div>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>© Virtual Space, 2026</p>
          <ScrollToTopButton />
        </div>
      </Container>
    </footer>
  );
}
