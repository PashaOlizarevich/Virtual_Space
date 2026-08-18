import { describe, expect, it } from "@jest/globals";

import { adminLoginSchema } from "@/modules/admin/schemas";

describe("adminLoginSchema", () => {
  it("accepts the configured preview credentials", () => {
    expect(adminLoginSchema.safeParse({ login: "admin", password: "123" }).success).toBe(true);
  });

  it.each([
    { login: "user", password: "123" },
    { login: "admin", password: "wrong" },
  ])("rejects invalid preview credentials", (credentials) => {
    expect(adminLoginSchema.safeParse(credentials).success).toBe(false);
  });
});
