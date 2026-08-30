import { describe, expect, it } from "@jest/globals";

import { productDtoSchema } from "@/modules/catalog/server/dto";

const product = {
  id: "42",
  slug: "forma-chair",
  name: "Forma",
  description: "A public product description",
  price: { amount: "1299.90", currency: "BYN" },
  image: "/images/forma.png",
  imageAlt: "Forma chair",
  newFrom: "2026-08-30T12:00:00.000Z",
  newUntil: null,
  gallery: [{ src: "/images/forma.png", alt: "Forma chair" }],
  specifications: [{ label: "Material", value: "Oak" }],
  optionGroups: [{ id: "color", label: "Color", options: [{ id: "sand", label: "Sand" }] }],
};

describe("productDtoSchema", () => {
  it("accepts a JSON-safe public product", () => {
    expect(productDtoSchema.parse(product)).toEqual(product);
  });

  it("rejects ORM values and internal fields", () => {
    expect(
      productDtoSchema.safeParse({
        ...product,
        price: { amount: { d: [1299, 9000000] }, currency: "BYN" },
        createdAt: "2026-08-30T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects non-canonical money and dates", () => {
    expect(
      productDtoSchema.safeParse({
        ...product,
        price: { amount: "1 299,90", currency: "BYN" },
        newFrom: "2026-08-30",
      }).success,
    ).toBe(false);
  });

  it("rejects unsafe image URL schemes", () => {
    expect(productDtoSchema.safeParse({ ...product, image: "data:image/svg+xml,x" }).success).toBe(
      false,
    );
  });
});
