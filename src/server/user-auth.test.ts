import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/auth", () => ({ auth: jest.fn() }));
jest.mock("@/server/db", () => ({ db: {} }));

describe("requireUser", () => {
  it("rejects a credentials JWT after password reset increments its version", async () => {
    const { auth } = await import("@/server/auth");
    const { db } = await import("@/server/db");
    const { requireUser, UserAuthenticationRequiredError } = await import("@/server/user-auth");
    jest.mocked(auth).mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "USER",
        credentialsVersion: 0,
      },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as never);
    Object.assign(db, {
      user: {
        findUnique: jest.fn(async () => ({
          id: "user-1",
          name: "User",
          email: "user@example.com",
          phone: null,
          role: "USER",
          credentialsVersion: 1,
          deletedAt: null,
        })),
      },
    });

    await expect(requireUser()).rejects.toBeInstanceOf(UserAuthenticationRequiredError);
  });
});
