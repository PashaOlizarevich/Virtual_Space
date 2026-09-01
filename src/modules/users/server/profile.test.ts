import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/server/user-auth", () => ({ requireUser: jest.fn() }));

describe("own profile service", () => {
  it("checks the authenticated principal and updates only profile allowlist fields", async () => {
    const { updateOwnProfile } = await import("@/modules/users/server/profile");
    const { requireUser } = await import("@/server/user-auth");
    const { db } = await import("@/server/db");
    jest.mocked(requireUser).mockResolvedValue({
      id: "user-1",
      name: "Old",
      email: "old@example.com",
      phone: null,
      role: "USER",
      credentialsVersion: 0,
      deletedAt: null,
    });
    const update = jest.fn(async () => ({
      name: "Анна",
      email: "new@example.com",
      phone: "+375 29 000-00-00",
    }));
    Object.assign(db, { user: { update } });

    await expect(
      updateOwnProfile({
        name: "Анна",
        email: " NEW@example.com ",
        phone: "+375 29 000-00-00",
      }),
    ).resolves.toEqual({
      name: "Анна",
      email: "new@example.com",
      phone: "+375 29 000-00-00",
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "user-1", deletedAt: null },
      data: {
        name: "Анна",
        email: "new@example.com",
        phone: "+375 29 000-00-00",
      },
      select: { name: true, email: true, phone: true },
    });
  });

  it("rejects mass-assignment before authentication or database access", async () => {
    const { updateOwnProfile, ProfileInputError } = await import("@/modules/users/server/profile");
    const { requireUser } = await import("@/server/user-auth");
    jest.mocked(requireUser).mockClear();

    await expect(
      updateOwnProfile({
        name: "Анна",
        email: "user@example.com",
        phone: "+375 29 000-00-00",
        role: "ADMIN",
      }),
    ).rejects.toBeInstanceOf(ProfileInputError);
    expect(requireUser).not.toHaveBeenCalled();
  });
});
