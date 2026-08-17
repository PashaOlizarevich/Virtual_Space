import { ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О нас" },
] as const;

export function Header() {
  return (
    <header className="header">
      <Container className="header__container">
        <MobileNavigation />

        <nav className="header__navigation" aria-label="Основная навигация">
          <ul className="header__links">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} prefetch={item.href === "/" ? undefined : false}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link className="header__logo" href="/" aria-label="Virtual Space — на главную">
          Virtual Space
        </Link>

        <div className="header__actions">
          <Link
            className="header__icon-link"
            href="/profile"
            prefetch={false}
            aria-label="Личный кабинет"
          >
            <UserRound aria-hidden="true" />
          </Link>
          <Button
            className="header__icon-button"
            variant="ghost"
            size="icon"
            aria-label="Открыть корзину"
          >
            <ShoppingBag aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </header>
  );
}
