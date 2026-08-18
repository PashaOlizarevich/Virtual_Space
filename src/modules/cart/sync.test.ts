import { describe, expect, it } from "@jest/globals";

import { mergeCarts } from "@/modules/cart/sync";

const chair = {
  productId: "forma-chair",
  quantity: 2,
  selectedOptions: [{ groupId: "color", optionId: "milk" }],
  observedPrice: 1390,
} as const;

describe("cart synchronization", () => {
  it("merges equal configurations and prefers the latest observed price", () => {
    expect(mergeCarts([chair], [{ ...chair, quantity: 3, observedPrice: 1490 }])).toEqual([
      { ...chair, quantity: 5, observedPrice: 1490 },
    ]);
  });

  it("rejects malformed untrusted cart data", () => {
    expect(() => mergeCarts([], [{ ...chair, quantity: 0 }])).toThrow(
      "Корзина содержит некорректные данные.",
    );
  });
});
