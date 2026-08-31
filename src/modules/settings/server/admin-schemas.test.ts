import { describe, expect, it } from "@jest/globals";

import { adminStoreSettingsUpdateSchema } from "@/modules/settings/server/admin-schemas";

const input = {
  name: "Virtual Space",
  description: "Public store description",
  contacts: [{ label: "Phone", value: "+375 29 000-00-00", href: "tel:+375290000000" }],
  socials: [{ label: "Telegram", href: "https://t.me/virtualspace" }],
};

describe("adminStoreSettingsUpdateSchema", () => {
  it("normalizes a complete settings payload", () => {
    expect(
      adminStoreSettingsUpdateSchema.parse({
        ...input,
        name: "  Virtual Space  ",
      }),
    ).toEqual(input);
  });

  it("rejects internal fields and unsafe public links", () => {
    expect(adminStoreSettingsUpdateSchema.safeParse({ ...input, key: "secondary" }).success).toBe(
      false,
    );
    expect(
      adminStoreSettingsUpdateSchema.safeParse({
        ...input,
        contacts: [{ label: "Website", value: "Open", href: "javascript:alert(1)" }],
      }).success,
    ).toBe(false);
  });
});
