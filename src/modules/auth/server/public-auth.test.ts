import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/modules/auth/server/password", () => ({ hashPassword: jest.fn() }));

describe("public credentials lifecycle", () => {
  beforeEach(async () => {
    const { db } = await import("@/server/db");
    for (const key of Object.keys(db)) delete (db as unknown as Record<string, unknown>)[key];
    jest.clearAllMocks();
  });

  it("registers a USER with normalized allowlisted data and a password hash", async () => {
    const { registerUser } = await import("@/modules/auth/server/public-auth");
    const { hashPassword } = await import("@/modules/auth/server/password");
    const { db } = await import("@/server/db");
    const create = jest.fn(async () => ({ id: "user-1", name: "Анна", email: "user@example.com" }));
    Object.assign(db, { user: { create } });
    jest.mocked(hashPassword).mockResolvedValue("stored-hash");

    await expect(
      registerUser({ name: " Анна ", email: " USER@Example.COM ", password: "strong-password" }),
    ).resolves.toEqual({ id: "user-1", name: "Анна", email: "user@example.com" });
    expect(create).toHaveBeenCalledWith({
      data: {
        name: "Анна",
        email: "user@example.com",
        passwordHash: "stored-hash",
        role: "USER",
      },
      select: { id: true, name: true, email: true },
    });
  });

  it("does not reveal whether a recovery email exists", async () => {
    const { createPasswordReset } = await import("@/modules/auth/server/public-auth");
    const { db } = await import("@/server/db");
    const findUnique = jest.fn(async () => null);
    Object.assign(db, { user: { findUnique } });

    await expect(createPasswordReset({ email: "UNKNOWN@example.com" })).resolves.toBeNull();
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "unknown@example.com" } }),
    );
  });

  it("consumes a reset token and increments the credentials version atomically", async () => {
    const { resetPassword } = await import("@/modules/auth/server/public-auth");
    const { hashPassword } = await import("@/modules/auth/server/password");
    const { db } = await import("@/server/db");
    const tokenRecord = {
      id: "reset-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    };
    const transaction = {
      passwordResetToken: {
        findUnique: jest.fn(async () => tokenRecord),
        deleteMany: jest.fn(async () => ({ count: 1 })),
      },
      user: { update: jest.fn(async () => ({ id: "user-1" })) },
    };
    Object.assign(db, {
      passwordResetToken: {
        findUnique: jest.fn(async () => tokenRecord),
        delete: jest.fn(),
      },
      $transaction: jest.fn(async (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
      ),
    });
    jest.mocked(hashPassword).mockResolvedValue("new-hash");

    await expect(
      resetPassword({ token: "a".repeat(43), password: "new-strong-password" }),
    ).resolves.toEqual({ reset: true });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: "user-1", deletedAt: null },
      data: { passwordHash: "new-hash", credentialsVersion: { increment: 1 } },
      select: { id: true },
    });
    expect(transaction.passwordResetToken.deleteMany).toHaveBeenLastCalledWith({
      where: { userId: "user-1" },
    });
  });
});
