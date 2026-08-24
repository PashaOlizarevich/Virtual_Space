import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import BedsPage from "@/app/(store)/catalog/beds/page";

describe("beds category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<BedsPage />);

    expect(html).toContain("Кровати, созданные для глубокого и спокойного сна");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Кровать Nubi");
    expect(html).toContain("Кровать Ardea");
    expect(html).toContain("Кровать Linea");
  });
});
