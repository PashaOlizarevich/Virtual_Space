import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import { getPublicStoreSettings } from "@/modules/settings/server/service";

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

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.7 3.5 2.9 10.4c-1.2.5-1.2 1.1-.2 1.4l4.6 1.4 1.7 5.3c.2.6.1.8.7.8.4 0 .7-.2.9-.4l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.2c.3-1.3-.5-1.9-1.3-1.7ZM9.1 12.9l8.9-5.6c.4-.3.8-.1.5.2l-7.3 6.6-.3 3.2-1.8-4.4Z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-1.6 0-3.5.4-5.2l1.3-5.4s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.5 1.8.9 3.3 2.7 3.3 3.2 0 5.1-3.9 5.1-8.5 0-3.5-2.9-6.1-6.6-6.1-4.2 0-7.2 3.1-7.2 6.7 0 1.2.4 2.4 1.1 3.2.1.1.1.2.1.4l-.4 1.5c-.1.5-.6.6-1 .4-2.2-1-3.2-3.6-3.2-6.5C3.1 4.3 7 0 13.9 0 19.6 0 23 4.1 23 8.5c0 5.8-3.2 10.1-7.9 10.1-1.6 0-3-.9-3.5-1.9l-1 3.8c-.4 1.4-1.1 2.7-1.8 3.7.9.3 2 .5 3.2.5A10 10 0 0 0 12 2Z" />
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

function SocialIcon({ label }: Readonly<{ label: string }>) {
  const normalizedLabel = label.toLocaleLowerCase("ru");

  if (normalizedLabel.includes("telegram")) return <TelegramIcon />;
  if (normalizedLabel.includes("pinterest")) return <PinterestIcon />;
  return <InstagramIcon />;
}

export async function SiteFooter() {
  const storeProfile = await getPublicStoreSettings();

  if (!storeProfile) throw new Error("Primary public store settings are not configured");

  const orderedContacts = [
    storeProfile.contacts.find((contact) => contact.href?.startsWith("tel:")),
    storeProfile.contacts.find((contact) => contact.label === "Часы работы"),
    storeProfile.contacts.find((contact) => contact.href?.startsWith("mailto:")),
    storeProfile.contacts.find((contact) => !contact.href && contact.label !== "Часы работы"),
  ].filter((contact): contact is (typeof storeProfile.contacts)[number] => Boolean(contact));

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
              {storeProfile.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${storeProfile.name} в ${social.label} — откроется в новой вкладке`}
                >
                  <SocialIcon label={social.label} />
                </a>
              ))}
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
