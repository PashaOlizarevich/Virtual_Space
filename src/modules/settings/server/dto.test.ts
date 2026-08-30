import { describe, expect, it } from "@jest/globals";

import { publicStoreSettingsDtoSchema } from "@/modules/settings/server/dto";

const settings = {
  name: "Virtual Space",
  description: "Public store description",
  contacts: [{ label: "Phone", value: "+375 29 000-00-00", href: "tel:+375290000000" }],
  socials: [{ label: "Telegram", href: "https://t.me/virtualspace" }],
};

describe("publicStoreSettingsDtoSchema", () => {
  it("accepts public settings", () => {
    expect(publicStoreSettingsDtoSchema.parse(settings)).toEqual(settings);
  });

  it("rejects internal fields and unsafe links", () => {
    expect(
      publicStoreSettingsDtoSchema.safeParse({
        ...settings,
        key: "primary",
        contacts: [{ label: "Website", value: "Open", href: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
  });
});
