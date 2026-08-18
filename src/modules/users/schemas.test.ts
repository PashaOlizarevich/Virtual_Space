import { describe, expect, it } from "@jest/globals";

import { profileDetailsSchema } from "@/modules/users/schemas";

describe("profile details schema", () => {
  it("normalizes valid profile details", () => {
    expect(
      profileDetailsSchema.parse({
        name: "  Анна  ",
        email: " anna@example.com ",
        phone: "+375 29 123-45-67",
      }),
    ).toEqual({ name: "Анна", email: "anna@example.com", phone: "+375 29 123-45-67" });
  });

  it("rejects malformed contact details", () => {
    expect(
      profileDetailsSchema.safeParse({ name: "А", email: "wrong", phone: "call-me" }).success,
    ).toBe(false);
  });
});
