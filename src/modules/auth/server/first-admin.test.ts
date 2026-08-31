import { describe, expect, it, jest } from "@jest/globals";

import {
  createFirstAdmin,
  FirstAdminEmailConflictError,
  InvalidFirstAdminConfigurationError,
  parseFirstAdminEnvironment,
} from "@/modules/auth/server/first-admin";

function createDatabaseMock(options?: { adminExists?: boolean; emailExists?: boolean }) {
  const transaction = {
    $executeRawUnsafe: jest.fn<(query: string) => Promise<number>>(async () => 1),
    user: {
      findFirst: jest.fn(async () => (options?.adminExists ? { id: "admin-1" } : null)),
      findUnique: jest.fn(async () => (options?.emailExists ? { id: "user-1" } : null)),
      create: jest.fn<(args: unknown) => Promise<{ id: string }>>(async () => ({ id: "admin-1" })),
    },
  };
  const executeTransaction = async <Result>(
    operation: (client: typeof transaction) => Promise<Result>,
  ) => operation(transaction);

  return { executeTransaction, transaction };
}

describe("first administrator bootstrap", () => {
  it("validates and normalizes protected environment input", () => {
    expect(
      parseFirstAdminEnvironment({
        FIRST_ADMIN_EMAIL: "  ADMIN@Example.COM ",
        FIRST_ADMIN_PASSWORD: "a-secure-password",
        FIRST_ADMIN_NAME: "  Store Admin  ",
      }),
    ).toEqual({
      email: "admin@example.com",
      password: "a-secure-password",
      name: "Store Admin",
    });

    expect(() =>
      parseFirstAdminEnvironment({
        FIRST_ADMIN_EMAIL: "invalid",
        FIRST_ADMIN_PASSWORD: "short",
      }),
    ).toThrow(InvalidFirstAdminConfigurationError);
  });

  it("creates an admin with a password hash after taking the bootstrap lock", async () => {
    const { executeTransaction, transaction } = createDatabaseMock();
    const createPasswordHash = jest.fn<(password: string) => Promise<string>>(async () =>
      Promise.resolve("stored-hash"),
    );

    await expect(
      createFirstAdmin(
        executeTransaction,
        {
          email: "admin@example.com",
          password: "a-secure-password",
          name: "Store Admin",
        },
        createPasswordHash,
      ),
    ).resolves.toEqual({ status: "created" });

    expect(transaction.$executeRawUnsafe).toHaveBeenCalledTimes(1);
    expect(createPasswordHash).toHaveBeenCalledWith("a-secure-password");
    expect(transaction.user.create).toHaveBeenCalledWith({
      data: {
        email: "admin@example.com",
        name: "Store Admin",
        passwordHash: "stored-hash",
        role: "ADMIN",
      },
      select: { id: true },
    });
  });

  it("is a no-op when an administrator already exists", async () => {
    const { executeTransaction, transaction } = createDatabaseMock({ adminExists: true });
    const createPasswordHash = jest.fn<(password: string) => Promise<string>>(async () =>
      Promise.resolve("stored-hash"),
    );

    await expect(
      createFirstAdmin(
        executeTransaction,
        {
          email: "admin@example.com",
          password: "a-secure-password",
        },
        createPasswordHash,
      ),
    ).resolves.toEqual({ status: "already-exists" });

    expect(createPasswordHash).not.toHaveBeenCalled();
    expect(transaction.user.create).not.toHaveBeenCalled();
  });

  it("does not elevate an existing user with the configured email", async () => {
    const { executeTransaction, transaction } = createDatabaseMock({ emailExists: true });

    await expect(
      createFirstAdmin(executeTransaction, {
        email: "user@example.com",
        password: "a-secure-password",
      }),
    ).rejects.toBeInstanceOf(FirstAdminEmailConflictError);
    expect(transaction.user.create).not.toHaveBeenCalled();
  });
});
