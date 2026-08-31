import { describe, expect, it, jest } from "@jest/globals";

import {
  AdminAccessRequiredError,
  authorizeAdminOperation,
  type AdminPrincipal,
} from "@/server/admin-access";

describe("authorizeAdminOperation", () => {
  const principal: AdminPrincipal = {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
  };

  it("checks access before forwarding input to an administrative operation", async () => {
    const getPrincipal = jest.fn(async () => principal);
    const operation = jest.fn(async (admin: AdminPrincipal, value: string) => ({
      adminId: admin.id,
      value,
    }));

    await expect(
      authorizeAdminOperation(getPrincipal, operation, "validated-input"),
    ).resolves.toEqual({ adminId: "admin-1", value: "validated-input" });
    expect(getPrincipal).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledWith(principal, "validated-input");
  });

  it("does not run the operation when the current session is forbidden", async () => {
    const getPrincipal = jest.fn(async () => {
      throw new AdminAccessRequiredError();
    });
    const operation = jest.fn(async () => "unreachable");

    await expect(authorizeAdminOperation(getPrincipal, operation)).rejects.toBeInstanceOf(
      AdminAccessRequiredError,
    );
    expect(operation).not.toHaveBeenCalled();
  });
});
