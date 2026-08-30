import { describe, expect, it } from "@jest/globals";

import { mapPublicStoreSettingsRecord } from "@/modules/settings/server/mapper";

describe("public store settings Prisma mapper", () => {
  it("parses JSON columns into a strict public DTO", () => {
    expect(
      mapPublicStoreSettingsRecord({
        name: "Virtual Space",
        description: "Public store description",
        contacts: [{ label: "Phone", value: "+375 29 000-00-00", href: "tel:+375290000000" }],
        socials: [{ label: "Telegram", href: "https://t.me/virtualspace" }],
      }),
    ).toEqual({
      name: "Virtual Space",
      description: "Public store description",
      contacts: [{ label: "Phone", value: "+375 29 000-00-00", href: "tel:+375290000000" }],
      socials: [{ label: "Telegram", href: "https://t.me/virtualspace" }],
    });
  });

  it("rejects malformed values from JSON columns", () => {
    expect(() =>
      mapPublicStoreSettingsRecord({
        name: "Virtual Space",
        description: "Public store description",
        contacts: [{ label: "Website", value: "Open", href: "javascript:alert(1)" }],
        socials: [],
      }),
    ).toThrow();
  });
});
