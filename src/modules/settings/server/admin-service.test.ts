import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));

const settings = {
  name: "Virtual Space",
  description: "Public store description",
  contacts: [{ label: "Phone", value: "+375 29 000-00-00", href: "tel:+375290000000" }],
  socials: [{ label: "Telegram", href: "https://t.me/virtualspace" }],
};

describe("settings admin service", () => {
  it("reads only the primary settings record", async () => {
    const { getAdminStoreSettings: readSettings } =
      await import("@/modules/settings/server/admin-service");
    const { publicStoreSettingsSelect } = await import("@/modules/settings/server/queries");
    const findUnique = jest.fn<(args: unknown) => Promise<typeof settings>>(async () => settings);

    await expect(readSettings({ storeSettings: { findUnique } } as never)).resolves.toEqual(
      settings,
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: { key: "primary" },
      select: publicStoreSettingsSelect,
    });
  });

  it("returns a domain error when the primary record is missing", async () => {
    const { getAdminStoreSettings: readSettings, StoreSettingsNotFoundError } =
      await import("@/modules/settings/server/admin-service");
    const findUnique = jest.fn<(args: unknown) => Promise<null>>(async () => null);

    await expect(readSettings({ storeSettings: { findUnique } } as never)).rejects.toBeInstanceOf(
      StoreSettingsNotFoundError,
    );
  });

  it("updates the stable primary record with allowlisted fields", async () => {
    const { updateAdminStoreSettings: saveSettings } =
      await import("@/modules/settings/server/admin-service");
    const { publicStoreSettingsSelect } = await import("@/modules/settings/server/queries");
    const update = jest.fn<(args: unknown) => Promise<typeof settings>>(async () => settings);

    await expect(saveSettings(settings, { storeSettings: { update } } as never)).resolves.toEqual(
      settings,
    );
    expect(update).toHaveBeenCalledWith({
      where: { key: "primary" },
      data: settings,
      select: publicStoreSettingsSelect,
    });
  });

  it("validates input before reaching Prisma", async () => {
    const { updateAdminStoreSettings: saveSettings } =
      await import("@/modules/settings/server/admin-service");
    const update = jest.fn<(args: unknown) => Promise<typeof settings>>(async () => settings);

    await expect(
      saveSettings(
        { ...settings, key: "secondary" } as never,
        {
          storeSettings: { update },
        } as never,
      ),
    ).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });
});
