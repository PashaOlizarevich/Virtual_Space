import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { useCartStore } from "@/modules/cart/store";
import { ProductConfigurator } from "@/modules/catalog/components/product-configurator";
import { products } from "@/modules/catalog/mock-data";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("ProductConfigurator", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ items: [] });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("adds the default product configuration and announces the result", () => {
    const product = products[0];

    act(() => root.render(<ProductConfigurator product={product} />));
    act(() => {
      container.querySelector<HTMLButtonElement>("button")?.click();
    });

    expect(useCartStore.getState().items).toEqual([
      {
        productId: product.id,
        quantity: 1,
        observedPrice: product.price,
        selectedOptions: [
          { groupId: "upholstery", optionId: "boucle" },
          { groupId: "color", optionId: "milk" },
        ],
      },
    ]);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Букле, Молочный");
  });

  it("uses the selected options and clears the previous confirmation", () => {
    const product = products[0];

    act(() => root.render(<ProductConfigurator product={product} />));
    const addButton = container.querySelector<HTMLButtonElement>("button");
    act(() => addButton?.click());

    const sand = container.querySelector<HTMLInputElement>('input[value="sand"]');
    expect(sand).not.toBeNull();
    act(() => {
      sand!.click();
    });
    expect(container.querySelector('[role="status"]')?.textContent).toBe("");

    act(() => addButton?.click());
    expect(useCartStore.getState().items[1]?.selectedOptions).toContainEqual({
      groupId: "color",
      optionId: "sand",
    });
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Песочный");
  });
});
