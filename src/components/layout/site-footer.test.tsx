import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import { storeProfile } from "@/modules/settings/mock-data";

jest.mock("@/modules/settings/server/service", () => ({ getPublicStoreSettings: jest.fn() }));

beforeEach(async () => {
  const { getPublicStoreSettings } = await import("@/modules/settings/server/service");

  jest.mocked(getPublicStoreSettings).mockResolvedValue({
    ...storeProfile,
    contacts: storeProfile.contacts.map((contact) => ({ ...contact })),
    socials: storeProfile.socials.map((social) => ({ ...social })),
  });
});

describe("SiteFooter", () => {
  it("renders public navigation, store profile contacts and accessible controls", async () => {
    const { SiteFooter } = await import("@/components/layout/site-footer");
    const markup = renderToStaticMarkup(await SiteFooter());

    expect(markup).toContain("<footer");
    expect(markup).toContain('aria-labelledby="footer-company-heading"');
    expect(markup).toContain('href="/about"');
    expect(markup).toContain('href="/stores"');
    expect(markup).not.toContain('href="/catalog"');

    for (const contact of storeProfile.contacts) {
      expect(markup).toContain(contact.value);
    }

    for (const social of storeProfile.socials) {
      expect(markup).toContain(`href="${social.href}"`);
    }
    expect(markup).toContain("Virtual Space в Instagram — откроется в новой вкладке");
    expect(markup.match(/rel="noopener noreferrer"/g)).toHaveLength(3);
    expect(markup).toContain('aria-label="Прокрутить страницу наверх"');
  });
});
