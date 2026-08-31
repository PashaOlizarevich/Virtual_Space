import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const requireAdmin = jest.fn<() => Promise<{ id: string; email: string; role: "ADMIN" }>>();
const getAdminStoreSettings = jest.fn<() => Promise<unknown>>();
const updateAdminStoreSettings = jest.fn<(input: unknown) => Promise<unknown>>();

jest.mock("@/server/admin-auth", () => ({
  withAdminAuthorization:
    (operation: (admin: unknown, ...args: unknown[]) => Promise<unknown>) =>
    async (...args: unknown[]) => {
      const admin = await requireAdmin();
      return operation(admin, ...args);
    },
}));
jest.mock("@/modules/settings/server/admin-service", () => ({
  getAdminStoreSettings,
  updateAdminStoreSettings,
}));

describe("settings admin boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["read", async () => (await import("@/modules/settings/server/admin")).getAdminStoreSettings()],
    [
      "update",
      async () =>
        (await import("@/modules/settings/server/admin")).updateAdminStoreSettings({
          name: "Virtual Space",
          description: "Public store description",
          contacts: [],
          socials: [],
        }),
    ],
  ])("checks the current admin role before %s", async (_name, run) => {
    requireAdmin.mockRejectedValue(new Error("forbidden"));

    await expect(run()).rejects.toThrow("forbidden");
    expect(getAdminStoreSettings).not.toHaveBeenCalled();
    expect(updateAdminStoreSettings).not.toHaveBeenCalled();
  });

  it("forwards validated update input after authorization", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "ADMIN" });
    updateAdminStoreSettings.mockResolvedValue({ name: "Virtual Space" });
    const input = {
      name: "Virtual Space",
      description: "Public store description",
      contacts: [],
      socials: [],
    };

    const { updateAdminStoreSettings: protectedUpdate } =
      await import("@/modules/settings/server/admin");
    await expect(protectedUpdate(input)).resolves.toEqual({ name: "Virtual Space" });
    expect(requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      updateAdminStoreSettings.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
    expect(updateAdminStoreSettings).toHaveBeenCalledWith(input);
  });
});
