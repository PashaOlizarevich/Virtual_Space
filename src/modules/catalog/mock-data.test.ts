import { describe, expect, it } from "@jest/globals";

import { allProducts } from "@/modules/catalog/mock-data";

describe("catalog mock data", () => {
  it("contains unique product ids and slugs", () => {
    const ids = allProducts.map(({ id }) => id);
    const slugs = allProducts.map(({ slug }) => slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
