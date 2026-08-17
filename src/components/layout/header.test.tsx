import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { Header } from "@/components/layout/header";

describe("Header", () => {
  it("renders the store navigation and accessible actions", () => {
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain('aria-label="Основная навигация"');
    expect(markup).toContain('href="/catalog"');
    expect(markup).toContain('href="/about"');
    expect(markup).toContain('aria-label="Личный кабинет"');
    expect(markup).toContain('aria-label="Открыть корзину"');
    expect(markup).toContain('aria-label="Открыть меню"');
  });
});
