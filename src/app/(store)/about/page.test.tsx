import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import AboutPage from "@/app/(store)/about/page";

describe("AboutPage", () => {
  it("renders the story, current contacts, and social links", () => {
    const html = renderToStaticMarkup(<AboutPage />);

    expect(html).toContain("Пространство для жизни");
    expect(html).toContain("Мебель, которая остаётся с вами");
    expect(html).toContain("%2Fimages%2Fabout%2Fabout-interior.png");
    expect(html).toContain("Минск, посещение по предварительной записи");
    expect(html).toContain('href="mailto:hello@virtualspace.example"');
    expect(html).toContain('href="https://www.instagram.com/virtualspace"');
    expect(html.match(/target="_blank"/g)).toHaveLength(3);
  });
});
