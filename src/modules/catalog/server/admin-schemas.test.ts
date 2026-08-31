import { describe, expect, it } from "@jest/globals";

import {
  categoryCreateSchema,
  imageCreateSchema,
  productCreateSchema,
} from "@/modules/catalog/server/admin-schemas";

const validProduct = {
  categoryId: "1",
  slug: "cloud-sofa",
  name: "Cloud sofa",
  description: "A sufficiently detailed product description",
  price: "1999.90",
  stock: 4,
  isActive: true,
  newFrom: "2026-08-01T00:00:00.000Z",
  newUntil: "2026-09-01T00:00:00.000Z",
  material: "Textile",
  style: "Modern",
  dimensions: "220 × 95 cm",
};

describe("catalog admin input schemas", () => {
  it("rejects unknown fields to prevent mass assignment", () => {
    expect(() => categoryCreateSchema.parse({ slug: "sofas", name: "Sofas", id: "99" })).toThrow();
    expect(() => productCreateSchema.parse({ ...validProduct, currency: "USD" })).toThrow();
  });

  it("accepts an exact decimal string and a valid new-arrival period", () => {
    expect(productCreateSchema.parse(validProduct)).toMatchObject({
      price: "1999.90",
      newFrom: new Date("2026-08-01T00:00:00.000Z"),
    });
    expect(() => productCreateSchema.parse({ ...validProduct, price: "1e4" })).toThrow();
    expect(() =>
      productCreateSchema.parse({
        ...validProduct,
        newFrom: "2026-10-01T00:00:00.000Z",
      }),
    ).toThrow();
  });

  it("allows only HTTPS image metadata with a constrained public id", () => {
    expect(() =>
      imageCreateSchema.parse({
        productId: "1",
        cloudinaryPublicId: "virtual-space/sofas/cloud",
        secureUrl: "http://example.com/image.jpg",
        alt: "Cloud sofa",
        position: 0,
      }),
    ).toThrow();
  });
});
