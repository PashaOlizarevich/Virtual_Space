import { describe, expect, it, jest } from "@jest/globals";

import {
  AdminAccessRequiredError,
  AuthenticationRequiredError,
  resolveAdminPrincipal,
} from "@/server/admin-access";

describe("resolveAdminPrincipal", () => {
  it("rejects a missing session without querying the user", async () => {
    const findUser = jest.fn(async () => null);

    await expect(resolveAdminPrincipal(null, findUser)).rejects.toBeInstanceOf(
      AuthenticationRequiredError,
    );
    expect(findUser).not.toHaveBeenCalled();
  });

  it("rechecks the current database role and rejects a non-admin", async () => {
    const findUser = jest.fn(async () => ({
      id: "user-1",
      email: "user@example.com",
      role: "USER" as const,
    }));

    await expect(
      resolveAdminPrincipal({ user: { id: "user-1" } }, findUser),
    ).rejects.toBeInstanceOf(AdminAccessRequiredError);
  });

  it("returns a minimal principal for a current admin", async () => {
    const findUser = jest.fn(async () => ({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN" as const,
    }));

    await expect(resolveAdminPrincipal({ user: { id: "admin-1" } }, findUser)).resolves.toEqual({
      id: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });
});
