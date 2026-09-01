import { describe, expect, it } from "@jest/globals";

import { cartItemKey, mapServerCartToLocal } from "@/modules/cart/server-cart-adapter";

describe("server cart client adapter", () => {
  it("maps only safe server values into the local presentation model", () => {
    const [item] = mapServerCartToLocal({
      items: [
        {
          productId: "7",
          slug: "forma-armchair",
          name: "Кресло Forma",
          image: "/chair.jpg",
          imageAlt: "Кресло Forma",
          quantity: 2,
          selectedOptions: [
            { groupId: "color", groupLabel: "Цвет", optionId: "milk", optionLabel: "Молочный" },
          ],
          observedPrice: { amount: "1290.00", currency: "BYN" },
          currentPrice: { amount: "1390.00", currency: "BYN" },
          status: "PRICE_CHANGED",
        },
      ],
    });

    expect(item).toMatchObject({
      productId: "7",
      observedPrice: 1390,
      productSnapshot: { slug: "forma-armchair", name: "Кресло Forma" },
    });
    expect(cartItemKey(item!)).toBe("7|color:milk");
  });
});
