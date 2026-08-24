import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import MattressesPage from "@/app/(store)/catalog/mattresses/page";

describe("mattresses category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<MattressesPage />);

    expect(html).toContain("Матрасы для полноценного отдыха и естественного восстановления");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Матрас Alba");
    expect(html).toContain("Матрас Forma");
    expect(html).toContain("Матрас Noma");
  });
});
