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

  it("changes quantity and removes only the selected configuration", () => {
    useCartStore.getState().addItem(chair);
    useCartStore.getState().addItem({
      ...chair,
      selectedOptions: [{ groupId: "color", optionId: "sand" }],
    });

    const milkChair = useCartStore.getState().items[0];
    expect(milkChair).toBeDefined();
    if (!milkChair) return;

    expect(useCartStore.getState().setItemQuantity(milkChair, 3)).toBe(true);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);

    useCartStore.getState().removeItem(milkChair);
    expect(useCartStore.getState().items).toEqual([
      { ...chair, quantity: 1, selectedOptions: [{ groupId: "color", optionId: "sand" }] },
    ]);
  });

  it("rejects an out-of-range quantity", () => {
    useCartStore.getState().addItem(chair);
    const item = useCartStore.getState().items[0];
    expect(item).toBeDefined();
    if (!item) return;

    expect(useCartStore.getState().setItemQuantity(item, 0)).toBe(false);
    expect(useCartStore.getState().setItemQuantity(item, 100)).toBe(false);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });

  it("rejects malformed cart input", () => {
    const addItem = useCartStore.getState().addItem as (input: unknown) => boolean;

    expect(addItem({ ...chair, observedPrice: Number.NaN })).toBe(false);
    expect(addItem({ ...chair, quantity: 1000 })).toBe(false);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("confirms a current price without changing the selected configuration", () => {
    useCartStore.getState().addItem(chair);
    const item = useCartStore.getState().items[0];
    expect(item).toBeDefined();
    if (!item) return;

    expect(useCartStore.getState().confirmItemPrice(item, 1490)).toBe(true);
    expect(useCartStore.getState().items).toEqual([{ ...chair, quantity: 1, observedPrice: 1490 }]);
    expect(useCartStore.getState().confirmItemPrice(item, Number.NaN)).toBe(false);
  });

  it("clears items after a confirmed checkout", () => {
    useCartStore.getState().addItem(chair);

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toEqual([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toContain('"items":[]');
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
