import { describe, expect, it } from "@jest/globals";

import { loginSchema, recoverySchema, registrationSchema } from "@/modules/auth/schemas";
import { profileDetailsSchema } from "@/modules/users/schemas";

describe("public user input", () => {
  it.each([
    [
      "login",
      loginSchema,
      { email: "user@example.com", password: "strong-password", role: "ADMIN" },
    ],
    [
      "registration",
      registrationSchema,
      {
        name: "User",
        email: "user@example.com",
        password: "strong-password",
        role: "ADMIN",
      },
    ],
    ["recovery", recoverySchema, { email: "user@example.com", role: "ADMIN" }],
    [
      "profile",
      profileDetailsSchema,
      {
        name: "User",
        email: "user@example.com",
        phone: "+375 29 123-45-67",
        role: "ADMIN",
      },
    ],
  ])("rejects a role in %s input", (_name, schema, input) => {
    expect(schema.safeParse(input).success).toBe(false);
  });

  it("rejects passwordHash in registration input", () => {
    expect(
      registrationSchema.safeParse({
        name: "User",
        email: "user@example.com",
        password: "strong-password",
        passwordHash: "attacker-controlled-hash",
      }).success,
    ).toBe(false);
  });
});
