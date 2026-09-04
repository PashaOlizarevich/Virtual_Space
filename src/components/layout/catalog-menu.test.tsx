import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { CatalogMenu } from "@/components/layout/catalog-menu";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe("CatalogMenu closing", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false }),
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    jest.useRealTimers();
    act(() => root.unmount());
    container.remove();
  });

  it("closes after the panel transform transition and restores focus", () => {
    const { dialog, panel, trigger } = renderOpenMenu();

    act(() => {
      dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    expect(dialog.dataset.state).toBe("closing");

    act(() => {
      panel.dispatchEvent(transitionEvent("transitionend", "transform"));
    });

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("still closes through the fallback when the transform transition is cancelled", () => {
    jest.useFakeTimers();
    const { dialog, panel, trigger } = renderOpenMenu();

    act(() => {
      dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    act(() => {
      panel.dispatchEvent(transitionEvent("transitioncancel", "transform"));
    });
    act(() => jest.advanceTimersByTime(450));

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("closes through the fallback when no transition event arrives", () => {
    jest.useFakeTimers();
    const { dialog, trigger } = renderOpenMenu();

    act(() => {
      dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    expect(dialog.open).toBe(true);

    act(() => jest.advanceTimersByTime(450));

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  function renderOpenMenu() {
    act(() => root.render(<CatalogMenu />));

    const trigger = container.querySelector<HTMLButtonElement>("#catalog-menu-trigger");
    const dialog = document.querySelector<HTMLDialogElement>("#catalog-menu-dialog");
    const panel = dialog?.querySelector<HTMLDivElement>(".catalog-menu__panel");
    if (!trigger || !dialog || !panel) throw new Error("Catalog menu was not rendered");

    dialog.showModal = jest.fn(() => {
      Object.defineProperty(dialog, "open", { configurable: true, value: true, writable: true });
      dialog.dispatchEvent(new Event("toggle"));
    });
    dialog.close = jest.fn(() => {
      dialog.open = false;
      dialog.dispatchEvent(new Event("close"));
    });

    act(() => trigger.click());
    expect(dialog.open).toBe(true);

    return { dialog, panel, trigger };
  }
});

function transitionEvent(type: "transitionend" | "transitioncancel", propertyName: string) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  return event;
}
