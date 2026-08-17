import { beforeEach, describe, expect, it } from "@jest/globals";

import { CART_STORAGE_KEY, useCartStore } from "@/modules/cart/store";

const chair = {
  productId: "forma-chair",
  selectedOptions: [{ groupId: "color", optionId: "milk" }],
  observedPrice: 1390,
} as const;

describe("guest cart store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it("adds, merges and persists the same product configuration", () => {
    expect(useCartStore.getState().addItem(chair)).toBe(true);
    expect(useCartStore.getState().addItem({ ...chair, quantity: 2 })).toBe(true);

    expect(useCartStore.getState().items).toEqual([{ ...chair, quantity: 3 }]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toContain('"productId":"forma-chair"');
  });

  it("keeps different product configurations as separate entries", () => {
    useCartStore.getState().addItem(chair);
    useCartStore.getState().addItem({
      ...chair,
      selectedOptions: [{ groupId: "color", optionId: "sand" }],
    });

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("rejects malformed cart input", () => {
    const addItem = useCartStore.getState().addItem as (input: unknown) => boolean;

    expect(addItem({ ...chair, observedPrice: Number.NaN })).toBe(false);
    expect(addItem({ ...chair, quantity: 1000 })).toBe(false);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("discards untrusted persisted state during hydration", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ state: { items: [{ productId: "unsafe", quantity: -1 }] }, version: 1 }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items).toEqual([]);
  });
});
