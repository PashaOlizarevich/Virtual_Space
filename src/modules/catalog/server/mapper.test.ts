import { describe, expect, it } from "@jest/globals";

import {
  mapCatalogCursor,
  mapCategoryRecord,
  mapProductDetailRecord,
  mapProductPreviewRecord,
} from "@/modules/catalog/server/mapper";
import type { ProductPreviewRecord } from "@/modules/catalog/server/queries";

const productRecord = {
  id: BigInt(42),
  slug: "forma-chair",
  name: "Forma",
  description: "A public product description",
  price: { toFixed: () => "1299.90" },
  currency: "BYN" as const,
  newFrom: new Date("2026-08-30T12:00:00.000Z"),
  newUntil: null,
  createdAt: new Date("2026-08-29T12:00:00.000Z"),
  images: [
    { secureUrl: "https://example.com/forma.png", alt: "Forma chair" },
    { secureUrl: "https://example.com/forma-detail.png", alt: "Forma chair detail" },
  ],
} as ProductPreviewRecord;

describe("catalog Prisma mappers", () => {
  it("maps records and cursor to JSON-safe DTO values", () => {
    const preview = mapProductPreviewRecord(productRecord);
    const cursor = mapCatalogCursor({ id: productRecord.id, createdAt: productRecord.createdAt });

    expect(mapCategoryRecord({ slug: "chairs", name: "Chairs" })).toEqual({
      slug: "chairs",
      name: "Chairs",
    });
    expect(preview).toEqual({
      id: "42",
      slug: "forma-chair",
      name: "Forma",
      description: "A public product description",
      price: { amount: "1299.90", currency: "BYN" },
      image: "https://example.com/forma.png",
      imageAlt: "Forma chair",
      gallery: [
        { src: "https://example.com/forma.png", alt: "Forma chair" },
        { src: "https://example.com/forma-detail.png", alt: "Forma chair detail" },
      ],
      newFrom: "2026-08-30T12:00:00.000Z",
      newUntil: null,
    });
    expect(cursor).toEqual({ id: "42", createdAt: "2026-08-29T12:00:00.000Z" });
    expect(() => JSON.stringify({ preview, cursor })).not.toThrow();
  });

  it("maps detail relations using stable public keys", () => {
    expect(
      mapProductDetailRecord({
        ...productRecord,
        specifications: [{ label: "Material", value: "Oak" }],
        optionGroups: [
          {
            key: "color",
            label: "Color",
            options: [{ key: "sand", label: "Sand" }],
          },
        ],
      }),
    ).toMatchObject({
      gallery: [
        { src: "https://example.com/forma.png", alt: "Forma chair" },
        { src: "https://example.com/forma-detail.png", alt: "Forma chair detail" },
      ],
      specifications: [{ label: "Material", value: "Oak" }],
      optionGroups: [{ id: "color", label: "Color", options: [{ id: "sand", label: "Sand" }] }],
    });
  });

  it("rejects a public product without a primary image", () => {
    expect(() => mapProductPreviewRecord({ ...productRecord, images: [] })).toThrow();
  });
});
