import { describe, expect, it } from "@jest/globals";

import type { CartItem } from "@/modules/cart/types";
import { validateCartItem } from "@/modules/cart/validation";

const currentItem: CartItem = {
  productId: "forma-chair",
  quantity: 1,
  selectedOptions: [{ groupId: "color", optionId: "milk" }],
  observedPrice: 1390,
};

describe("cart item validation", () => {
  it("recognizes an available current item", () => {
    expect(validateCartItem(currentItem).status).toBe("available");
  });

  it("requires confirmation when the catalog price changed", () => {
    const result = validateCartItem({ ...currentItem, observedPrice: 1290 });
    expect(result.status).toBe("price-changed");
    if (result.status === "price-changed") expect(result.currentPrice).toBe(1390);
  });

  it("marks missing products and obsolete options unavailable", () => {
    expect(validateCartItem({ ...currentItem, productId: "removed-product" }).status).toBe(
      "unavailable",
    );
    expect(
      validateCartItem({
        ...currentItem,
        selectedOptions: [{ groupId: "color", optionId: "removed-option" }],
      }).status,
    ).toBe("unavailable");
  });
});
