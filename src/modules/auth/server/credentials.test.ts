import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/modules/auth/server/password", () => ({ verifyPassword: jest.fn() }));

describe("admin credentials", () => {
  it("normalizes email and returns only an authenticated admin identity", async () => {
    const { authorizeAdminCredentials } = await import("@/modules/auth/server/credentials");
    const { db } = await import("@/server/db");
    const { verifyPassword } = await import("@/modules/auth/server/password");
    const findUnique = jest.fn(async (query: unknown) => {
      void query;
      return {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin",
        image: null,
        passwordHash: "stored-hash",
        role: "ADMIN" as const,
      };
    });
    Object.assign(db, { user: { findUnique } });
    jest.mocked(verifyPassword).mockResolvedValue(true);

    await expect(
      authorizeAdminCredentials({ email: "  ADMIN@Example.COM ", password: "strong-password" }),
    ).resolves.toEqual({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      image: null,
      role: "ADMIN",
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "admin@example.com" } }),
    );
  });

  it("rejects invalid input before querying the database", async () => {
    const { authorizeAdminCredentials } = await import("@/modules/auth/server/credentials");
    const { db } = await import("@/server/db");
    const findUnique = jest.fn((query: unknown) => {
      void query;
      return undefined;
    });
    Object.assign(db, { user: { findUnique } });

    await expect(
      authorizeAdminCredentials({
        email: "not-an-email",
        password: "strong-password",
        role: "ADMIN",
      }),
    ).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("does not authorize a valid password for a non-admin", async () => {
    const { authorizeAdminCredentials } = await import("@/modules/auth/server/credentials");
    const { db } = await import("@/server/db");
    const { verifyPassword } = await import("@/modules/auth/server/password");
    Object.assign(db, {
      user: {
        findUnique: jest.fn(async (query: unknown) => {
          void query;
          return {
            id: "user-1",
            email: "user@example.com",
            name: null,
            image: null,
            passwordHash: "stored-hash",
            role: "USER",
          };
        }),
      },
    });
    jest.mocked(verifyPassword).mockResolvedValue(true);

    await expect(
      authorizeAdminCredentials({ email: "user@example.com", password: "strong-password" }),
    ).resolves.toBeNull();
  });
});
