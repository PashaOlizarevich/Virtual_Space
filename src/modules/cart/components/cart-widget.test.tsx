import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { CartWidget } from "@/modules/cart/components/cart-widget";
import { useCartStore } from "@/modules/cart/store";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const chair = {
  productId: "forma-armchair",
  quantity: 1,
  selectedOptions: [
    { groupId: "upholstery", optionId: "boucle" },
    { groupId: "color", optionId: "milk" },
  ],
  observedPrice: 1390,
} as const;

describe("CartWidget", () => {
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

  it("renders an empty cart and opens its dialog", () => {
    act(() => root.render(<CartWidget />));
    const dialog = container.querySelector<HTMLDialogElement>("dialog");
    expect(dialog).not.toBeNull();
    dialog!.showModal = jest.fn();

    act(() => {
      container.querySelector<HTMLButtonElement>("#cart-widget-trigger")?.click();
    });

    expect(dialog!.showModal).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Корзина пока пуста");
    expect(container.querySelector<HTMLAnchorElement>('[href="/checkout"]')?.ariaDisabled).toBe(
      "true",
    );
  });

  it("updates quantity, total and removes a product", () => {
    useCartStore.setState({ items: [chair] });
    act(() => root.render(<CartWidget />));

    const increase = container.querySelector<HTMLButtonElement>(
      'button[aria-label^="Увеличить количество"]',
    );
    act(() => increase?.click());

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(container.querySelector("output")?.textContent).toBe("2");
    expect(container.textContent).toContain("2 780");
    expect(container.querySelector<HTMLAnchorElement>('[href="/checkout"]')?.ariaDisabled).toBe(
      "false",
    );

    const remove = container.querySelector<HTMLButtonElement>('button[aria-label^="Удалить"]');
    act(() => remove?.click());

    expect(useCartStore.getState().items).toEqual([]);
    expect(container.textContent).toContain("Корзина пока пуста");
  });
});
