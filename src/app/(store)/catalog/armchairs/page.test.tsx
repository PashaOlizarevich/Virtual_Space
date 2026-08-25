import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import ArmchairsPage from "@/app/(store)/catalog/armchairs/page";

describe("armchairs category", () => {
  it("renders the category description and four linked products", () => {
    const html = renderToStaticMarkup(<ArmchairsPage />);

    expect(html).toContain("Кресло создаёт личное пространство для чтения");
    expect(html.match(/class="product-preview"/g)).toHaveLength(4);
    expect(html).toContain("Кресло Forma");
    expect(html).toContain("Кресло Aster");
    expect(html).toContain("Кресло Runa");
    expect(html).toContain("Кресло Vero");
    expect(html).toContain('href="/product/aster-armchair"');
    expect(html).toContain('href="/product/runa-armchair"');
    expect(html).toContain('href="/product/vero-armchair"');
    expect(html).toContain('href="/product/forma-armchair"');
  });
});
