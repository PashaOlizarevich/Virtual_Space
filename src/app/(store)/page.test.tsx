import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { featuredProducts } from "@/modules/catalog/mock-data";
import { storeProfile } from "@/modules/settings/mock-data";
import { catalogResult } from "@/test/catalog-service-fixtures";

jest.mock("@/modules/catalog/server/service", () => ({ getPublicCatalog: jest.fn() }));
jest.mock("@/modules/settings/server/service", () => ({ getPublicStoreSettings: jest.fn() }));

beforeEach(async () => {
  const { getPublicCatalog } = await import("@/modules/catalog/server/service");
  const { getPublicStoreSettings } = await import("@/modules/settings/server/service");

  jest.mocked(getPublicCatalog).mockResolvedValue(catalogResult(featuredProducts.slice(0, 4)));
  jest.mocked(getPublicStoreSettings).mockResolvedValue({
    ...storeProfile,
    contacts: storeProfile.contacts.map((contact) => ({ ...contact })),
    socials: storeProfile.socials.map((social) => ({ ...social })),
  });
});

describe("HomePage", () => {
  it("renders the store information, featured products, and advantages", async () => {
    const { default: HomePage } = await import("@/app/(store)/page");
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Пространство, в котором хочется остаться");
    expect(html).toContain("Избранное для вашего дома");
    expect(html.match(/class=\"product-preview\"/g)).toHaveLength(4);
    expect(html.match(/>Подробнее<\/a>/g)).toHaveLength(4);
    expect(html.match(/>Добавить в корзину<\/button>/g)).toHaveLength(4);
    expect(html.match(/>Перейти к товару<\/a>/g)).toHaveLength(4);
    expect(html).toContain('aria-label="Кратко о товаре «Кресло Forma»"');
    expect(html).toContain("1 390 Br");
    expect(html).toContain('href="/product/forma-armchair"');
    expect(html).toContain('aria-label="Добавить «Кресло Forma» в корзину"');
    expect(html).toContain("Почему Virtual Space");
    expect(html).not.toContain("Давайте создадим пространство вместе");
    expect(html).not.toContain("hello@virtualspace.example");
    expect(html).not.toContain("Рейтинг");
  });
});
