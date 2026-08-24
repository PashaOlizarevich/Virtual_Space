import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { Header } from "@/components/layout/header";

describe("Header", () => {
  it("renders the store navigation and accessible actions", () => {
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain('aria-label="Основная навигация"');
    expect(markup).toContain('href="/catalog"');
    expect(markup).toContain('aria-controls="catalog-menu-dialog"');
    expect(markup).toContain("Столы для гостиной");
    expect(markup).toContain("Текстиль и декор");
    expect(markup).toContain('href="/catalog/chairs"');
    expect(markup).toContain('href="/catalog/sofas"');
    expect(markup).toContain('href="/catalog/tableware"');
    expect(markup).toContain("Весь каталог");
    expect(markup).toContain('href="/about#about-contact-title"');
    expect(markup).toContain('href="/about"');
    expect(markup).toMatch(/Каталог[\s\S]*Магазины[\s\S]*Новинки[\s\S]*Акции[\s\S]*О нас/);
    expect(markup).toContain('role="search"');
    expect(markup).toContain('aria-label="Открыть поиск"');
    expect(markup).toContain('aria-label="Поиск товаров"');
    expect(markup).toContain('aria-label="Личный кабинет"');
    expect(markup).toContain('aria-label="Открыть корзину"');
    expect(markup).toContain('aria-label="Открыть меню"');
  });

  it("renders the accessible wordmark as a sequential letter wave", () => {
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain('<span class="sr-only">Virtual Space</span>');
    expect(markup).toContain('class="header__wordmark" aria-hidden="true"');
    expect(markup.match(/class="header__wordmark-letter"/g)).toHaveLength(13);
    expect(markup).toContain("animation-delay:0.0s");
    expect(markup).toContain("animation-delay:2.4s");
  });
});
