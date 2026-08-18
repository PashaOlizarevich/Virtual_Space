import { describe, expect, it } from "@jest/globals";

import {
  adminLoginSchema,
  adminProductImagesSchema,
  adminProductSchema,
} from "@/modules/admin/schemas";

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

describe("adminProductSchema", () => {
  const product = {
    name: "Кресло Forma",
    slug: "forma-chair",
    category: "Кресла",
    description: "Удобное кресло для гостиной",
    price: 1390,
    stock: 7,
    published: true,
  };

  it("accepts a valid product draft", () => {
    expect(adminProductSchema.safeParse(product).success).toBe(true);
  });

  it("rejects unsafe slugs and negative stock", () => {
    expect(
      adminProductSchema.safeParse({ ...product, slug: "Forma Chair", stock: -1 }).success,
    ).toBe(false);
  });

  it("validates image type and size", () => {
    expect(
      adminProductImagesSchema.safeParse([
        new File(["image"], "chair.webp", { type: "image/webp" }),
      ]).success,
    ).toBe(true);
    expect(
      adminProductImagesSchema.safeParse([new File(["text"], "notes.txt", { type: "text/plain" })])
        .success,
    ).toBe(false);
  });
});
