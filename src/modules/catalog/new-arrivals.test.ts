import { describe, expect, it } from "@jest/globals";

import { getActiveNewArrivals, isActiveNewArrival } from "@/modules/catalog/new-arrivals";
import type { Product } from "@/modules/catalog/types";

const baseProduct = {
  id: "test-product",
  slug: "test-product",
  name: "Тестовый товар",
  description: "Описание",
  price: 100,
  currency: "BYN",
  image: "/test.png",
  imageAlt: "Тестовый товар",
  gallery: [],
  specifications: [],
  optionGroups: [],
} as const satisfies Product;

describe("new arrivals", () => {
  it.each([
    ["inside", "2026-08-10T00:00:00.000Z", true],
    ["at start boundary", "2026-08-01T00:00:00.000Z", true],
    ["at end boundary", "2026-08-31T23:59:59.999Z", true],
    ["before start", "2026-07-31T23:59:59.999Z", false],
    ["after end", "2026-09-01T00:00:00.000Z", false],
  ])("returns the expected status %s", (_label, now, expected) => {
    const product = {
      ...baseProduct,
      newFrom: "2026-08-01T00:00:00.000Z",
      newUntil: "2026-08-31T23:59:59.999Z",
    } satisfies Product;

    expect(isActiveNewArrival(product, new Date(now))).toBe(expected);
  });

  it("rejects products without a complete valid period", () => {
    expect(isActiveNewArrival(baseProduct, new Date("2026-08-10T00:00:00.000Z"))).toBe(false);
    expect(
      isActiveNewArrival(
        { ...baseProduct, newFrom: "invalid", newUntil: "2026-08-31T23:59:59.999Z" },
        new Date("2026-08-10T00:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("filters inactive products and sorts the newest starts first", () => {
    const older = {
      ...baseProduct,
      id: "older",
      newFrom: "2026-08-01T00:00:00.000Z",
      newUntil: "2026-08-31T23:59:59.999Z",
    } satisfies Product;
    const newer = {
      ...baseProduct,
      id: "newer",
      newFrom: "2026-08-08T00:00:00.000Z",
      newUntil: "2026-08-31T23:59:59.999Z",
    } satisfies Product;
    const future = {
      ...baseProduct,
      id: "future",
      newFrom: "2026-09-01T00:00:00.000Z",
      newUntil: "2026-09-30T23:59:59.999Z",
    } satisfies Product;

    expect(
      getActiveNewArrivals([older, future, newer], new Date("2026-08-10T00:00:00.000Z")),
    ).toEqual([newer, older]);
  });
});
