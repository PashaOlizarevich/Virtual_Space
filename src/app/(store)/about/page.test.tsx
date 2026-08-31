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

describe("AboutPage", () => {
  it("renders the story, current contacts, and social links", async () => {
    const { default: AboutPage } = await import("@/app/(store)/about/page");
    const html = renderToStaticMarkup(await AboutPage());

    expect(html).toContain("Пространство для жизни");
    expect(html).toContain("Мебель, которая остаётся с вами");
    expect(html).toContain("%2Fimages%2Fabout%2Fabout-interior.png");
    expect(html).toContain("Минск, посещение по предварительной записи");
    expect(html).toContain('href="mailto:hello@virtualspace.example"');
    expect(html).toContain('href="https://www.instagram.com/virtualspace"');
    expect(html.match(/target="_blank"/g)).toHaveLength(3);
  });
});
