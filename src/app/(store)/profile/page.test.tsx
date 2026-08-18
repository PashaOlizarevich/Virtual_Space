import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import ProfilePage from "@/app/(store)/profile/page";

describe("profile page", () => {
  it("renders profile, cart and order sections with an explicit preview notice", () => {
    const html = renderToStaticMarkup(<ProfilePage />);
    expect(html).toContain("Личный кабинет");
    expect(html).toContain("Контактная информация");
    expect(html).toContain("Корзина");
    expect(html).toContain("Заказы");
    expect(html).toContain("демонстрационном режиме");
    expect(html).toContain("В работе");
  });
});
