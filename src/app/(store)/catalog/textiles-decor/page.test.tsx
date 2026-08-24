import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import TextilesDecorPage from "@/app/(store)/catalog/textiles-decor/page";

describe("textiles and decor category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<TextilesDecorPage />);

    expect(html).toContain("Мягкие фактуры, природные материалы и выразительные детали");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Плед Lino");
    expect(html).toContain("Подушка Miro");
    expect(html).toContain("Ваза Sora");
  });
});
