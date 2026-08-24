import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import DiningTablesPage from "@/app/(store)/catalog/dining-tables/page";

describe("dining tables category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<DiningTablesPage />);

    expect(html).toContain("Обеденный стол становится центром дома");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Стол Tavola");
    expect(html).toContain("Стол Orbis");
    expect(html).toContain("Стол Elara");
  });
});
