import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { storeProfile } from "@/modules/settings/mock-data";

describe("SiteFooter", () => {
  it("renders public navigation, store profile contacts and accessible controls", () => {
    const markup = renderToStaticMarkup(<SiteFooter />);

    expect(markup).toContain("<footer");
    expect(markup).toContain('aria-labelledby="footer-company-heading"');
    expect(markup).toContain('href="/about"');
    expect(markup).toContain('href="/stores"');
    expect(markup).not.toContain('href="/catalog"');

    for (const contact of storeProfile.contacts) {
      expect(markup).toContain(contact.value);
    }

    expect(markup).toContain('href="https://t.me/"');
    expect(markup).toContain('href="https://vk.com/"');
    expect(markup).toContain('href="https://www.instagram.com/"');
    expect(markup).toContain("Virtual Space в Instagram — откроется в новой вкладке");
    expect(markup.match(/rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(markup).toContain('aria-label="Прокрутить страницу наверх"');
  });
});
