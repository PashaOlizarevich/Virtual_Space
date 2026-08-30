import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));

describe("public store settings query", () => {
  it("reads the primary profile using the public field allowlist", async () => {
    const { findPrimaryPublicStoreSettings, publicStoreSettingsSelect } =
      await import("@/modules/settings/server/queries");
    const findUnique = jest.fn(async () => null);

    await findPrimaryPublicStoreSettings({ storeSettings: { findUnique } } as never);

    expect(findUnique).toHaveBeenCalledWith({
      where: { key: "primary" },
      select: publicStoreSettingsSelect,
    });
  });
});
