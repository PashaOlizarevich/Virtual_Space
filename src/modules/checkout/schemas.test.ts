import { describe, expect, it } from "@jest/globals";

import { checkoutFormSchema } from "@/modules/checkout/schemas";

const validCheckout = {
  name: "Анна",
  phone: "+375 29 123-45-67",
  email: "anna@example.com",
  comment: "Позвоните перед доставкой",
};

describe("checkout form schema", () => {
  it("accepts and normalizes valid contact data", () => {
    expect(checkoutFormSchema.parse(validCheckout)).toEqual(validCheckout);
  });

  it("accepts an empty optional comment", () => {
    expect(checkoutFormSchema.safeParse({ ...validCheckout, comment: "" }).success).toBe(true);
  });

  it("rejects malformed and oversized contact data", () => {
    const result = checkoutFormSchema.safeParse({
      name: "A",
      phone: "call-me",
      email: "invalid",
      comment: "x".repeat(1001),
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors).toMatchObject({
      name: expect.any(Array),
      phone: expect.any(Array),
      email: expect.any(Array),
      comment: expect.any(Array),
    });
  });
});
