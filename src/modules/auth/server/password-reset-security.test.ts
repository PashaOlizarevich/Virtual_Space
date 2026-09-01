import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/modules/auth/server/password", () => ({ hashPassword: jest.fn() }));

describe("password reset security", () => {
  beforeEach(async () => {
    const { db } = await import("@/server/db");
    for (const key of Object.keys(db)) delete (db as unknown as Record<string, unknown>)[key];
    jest.clearAllMocks();
  });

  it("removes an expired token without hashing or changing credentials", async () => {
    const { resetPassword, InvalidPasswordResetTokenError } =
      await import("@/modules/auth/server/public-auth");
    const { hashPassword } = await import("@/modules/auth/server/password");
    const { db } = await import("@/server/db");
    const remove = jest.fn(async () => ({ id: "reset-1" }));
    Object.assign(db, {
      passwordResetToken: {
        findUnique: jest.fn(async () => ({
          id: "reset-1",
          expiresAt: new Date(Date.now() - 60_000),
        })),
        delete: remove,
      },
    });

    await expect(
      resetPassword({ token: "a".repeat(43), password: "new-strong-password" }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
    expect(remove).toHaveBeenCalledWith({ where: { id: "reset-1" } });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("rejects a token consumed by a concurrent request before changing credentials", async () => {
    const { resetPassword, InvalidPasswordResetTokenError } =
      await import("@/modules/auth/server/public-auth");
    const { hashPassword } = await import("@/modules/auth/server/password");
    const { db } = await import("@/server/db");
    const token = {
      id: "reset-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000),
    };
    const update = jest.fn();
    const transaction = {
      passwordResetToken: {
        findUnique: jest.fn(async () => token),
        deleteMany: jest.fn(async () => ({ count: 0 })),
      },
      user: { update },
    };
    Object.assign(db, {
      passwordResetToken: { findUnique: jest.fn(async () => token) },
      $transaction: jest.fn(async (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
      ),
    });
    jest.mocked(hashPassword).mockResolvedValue("new-hash");

    await expect(
      resetPassword({ token: "a".repeat(43), password: "new-strong-password" }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
    expect(update).not.toHaveBeenCalled();
  });
});
