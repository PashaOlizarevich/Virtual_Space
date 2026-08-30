import { describe, expect, it } from "@jest/globals";

import { catalogSeed, categoryNames, storeSettingsSeed } from "../../prisma/seed-data";
import { allProducts } from "@/modules/catalog/mock-data";
import { storeProfile } from "@/modules/settings/mock-data";

describe("database seed data", () => {
  it("maps every mock product to stable unique keys", () => {
    expect(catalogSeed).toHaveLength(allProducts.length);
    expect(new Set(catalogSeed.map((product) => product.slug)).size).toBe(catalogSeed.length);
    expect(catalogSeed.every((product) => product.categorySlug in categoryNames)).toBe(true);

    const imageKeys = catalogSeed.flatMap((product) =>
      product.images.map((image) => image.cloudinaryPublicId),
    );
    expect(new Set(imageKeys).size).toBe(imageKeys.length);
  });

  it("preserves stable option keys and valid ordering", () => {
    for (const product of catalogSeed) {
      expect(product.images.map((image) => image.position)).toEqual(
        product.images.map((_, index) => index),
      );
      for (const group of product.optionGroups) {
        expect(new Set(group.options.map((option) => option.key)).size).toBe(group.options.length);
      }
    }
  });

  it("maps the primary store profile", () => {
    expect(storeSettingsSeed).toEqual({
      key: "primary",
      name: storeProfile.name,
      description: storeProfile.description,
      contacts: storeProfile.contacts,
      socials: storeProfile.socials,
    });
  });
});
