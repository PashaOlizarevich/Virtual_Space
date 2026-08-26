import { beforeEach, describe, expect, it } from "@jest/globals";

import { FAVORITES_STORAGE_KEY, useFavoritesStore } from "@/modules/favorites/store";

describe("guest favorites store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useFavoritesStore.setState({ productIds: [] });
  });

  it("adds, removes and persists product IDs in insertion order", () => {
    expect(useFavoritesStore.getState().toggle("forma-armchair")).toBe(true);
    expect(useFavoritesStore.getState().toggle("aster-armchair")).toBe(true);
    expect(useFavoritesStore.getState().productIds).toEqual(["forma-armchair", "aster-armchair"]);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain(
      '"productIds":["forma-armchair","aster-armchair"]',
    );

    expect(useFavoritesStore.getState().toggle("forma-armchair")).toBe(true);
    expect(useFavoritesStore.getState().productIds).toEqual(["aster-armchair"]);
  });

  it("restores valid persisted favorites", async () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ state: { productIds: ["forma-armchair", "aster-armchair"] }, version: 1 }),
    );

    await useFavoritesStore.persist.rehydrate();

    expect(useFavoritesStore.getState().productIds).toEqual(["forma-armchair", "aster-armchair"]);
  });

  it("discards malformed persisted favorites", async () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ state: { productIds: ["valid", 42, ""] }, version: 1 }),
    );

    await useFavoritesStore.persist.rehydrate();

    expect(useFavoritesStore.getState().productIds).toEqual([]);
  });

  it("rejects invalid IDs and duplicate replacement values", () => {
    expect(useFavoritesStore.getState().toggle(" ")).toBe(false);
    expect(useFavoritesStore.getState().replace(["forma-armchair", "forma-armchair"])).toBe(true);
    expect(useFavoritesStore.getState().productIds).toEqual(["forma-armchair"]);
  });
});
