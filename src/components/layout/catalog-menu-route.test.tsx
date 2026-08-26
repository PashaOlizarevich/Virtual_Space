import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { Header } from "@/components/layout/header";

describe("catalog menu category routes", () => {
  it("links living room tables to their category page", () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('href="/catalog/living-room-tables"');
  });
});
