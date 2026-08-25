import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import PoufsPage from "@/app/(store)/catalog/poufs/page";

describe("poufs category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<PoufsPage />);

    expect(html).toContain("Пуфики добавляют интерьеру лёгкость и функциональность");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Пуф Arlo");
    expect(html).toContain("Пуф Nola");
    expect(html).toContain("Пуф Taro");
    expect(html).toContain('href="/product/arlo-pouf"');
    expect(html).toContain('href="/product/nola-pouf"');
    expect(html).toContain('href="/product/taro-pouf"');
  });
});
