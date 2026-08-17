import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import HomePage from "@/app/(store)/page";

describe("HomePage", () => {
  it("renders the store information, featured products, advantages, and contacts", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Пространство, в котором хочется остаться");
    expect(html).toContain("Избранное для вашего дома");
    expect(html.match(/class=\"product-preview\"/g)).toHaveLength(4);
    expect(html.match(/>Подробнее<\/a>/g)).toHaveLength(4);
    expect(html.match(/>Добавить в корзину<\/button>/g)).toHaveLength(4);
    expect(html.match(/>Перейти к товару<\/a>/g)).toHaveLength(4);
    expect(html).toContain('aria-label="Кратко о товаре «Кресло Forma»"');
    expect(html).toContain("86 × 92 × 74 см");
    expect(html).toContain('href="/product/forma-chair"');
    expect(html).toContain('aria-label="Добавить «Кресло Forma» в корзину"');
    expect(html).toContain("Почему Virtual Space");
    expect(html).toContain("hello@virtualspace.example");
    expect(html).not.toContain("Рейтинг");
  });
});
