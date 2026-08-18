import { describe, expect, it } from "@jest/globals";

import { adminLoginSchema } from "@/modules/admin/schemas";

describe("adminLoginSchema", () => {
  it("accepts valid administrative credentials shape", () => {
    expect(
      adminLoginSchema.safeParse({ email: "admin@example.com", password: "password1" }).success,
    ).toBe(true);
  });

  it("rejects malformed email and short password", () => {
    const result = adminLoginSchema.safeParse({ email: "admin", password: "123" });
    expect(result.success).toBe(false);
  });
});
