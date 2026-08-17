import { describe, expect, it } from "@jest/globals";
import { loginSchema, recoverySchema, registrationSchema } from "@/modules/auth/schemas";

describe("auth schemas", () => {
  it("accepts valid values", () => {
    expect(
      loginSchema.safeParse({ email: "user@example.com", password: "password1" }).success,
    ).toBe(true);
    expect(
      registrationSchema.safeParse({
        name: "Анна",
        email: "anna@example.com",
        password: "password1",
      }).success,
    ).toBe(true);
    expect(recoverySchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });
  it("rejects malformed or weak values", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "123" }).success).toBe(false);
    expect(registrationSchema.safeParse({ name: "A", email: "bad", password: "123" }).success).toBe(
      false,
    );
  });
});
