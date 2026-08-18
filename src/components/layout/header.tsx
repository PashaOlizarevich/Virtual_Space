import { Search, UserRound } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { CartWidget } from "@/modules/cart/components/cart-widget";

const navigationItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О нас" },
] as const;

const wordmark = "VIRTUAL SPACE";

export function Header() {
  return (
    <header className="header">
      <Container className="header__container">
        <MobileNavigation />

        <nav className="header__navigation" aria-label="Основная навигация">
          <ul className="header__links">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} prefetch={false}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className="header__logo" href="/" aria-label="Virtual Space — на главную">
          <span className="sr-only">Virtual Space</span>
          <span className="header__wordmark" aria-hidden="true">
            {[...wordmark].map((character, index) => (
              <span
                className="header__wordmark-letter"
                style={{ animationDelay: `${(index * 0.2).toFixed(1)}s` }}
                key={`${character}-${index}`}
              >
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </span>
        </Link>

        <div className="header__actions">
          <Button
            className="header__icon-button"
            variant="ghost"
            size="icon"
            aria-label="Открыть поиск по сайту"
          >
            <Search aria-hidden="true" />
          </Button>
          <Link
            className="header__icon-link"
            href="/login"
            prefetch={false}
            aria-label="Личный кабинет"
          >
            <UserRound aria-hidden="true" />
          </Link>
          <CartWidget />
        </div>
      </Container>
    </header>
  );
}
