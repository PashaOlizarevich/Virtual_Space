import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import LivingRoomTablesPage from "@/app/(store)/catalog/living-room-tables/page";

describe("living room tables category", () => {
  it("renders the category description and exactly three products", () => {
    const html = renderToStaticMarkup(<LivingRoomTablesPage />);

    expect(html).toContain("Стол в гостиной объединяет зону отдыха");
    expect(html.match(/class="product-preview"/g)).toHaveLength(3);
    expect(html).toContain("Стол Riva");
    expect(html).toContain("Стол Orsa");
    expect(html).toContain("Стол Plano");
  });
});
