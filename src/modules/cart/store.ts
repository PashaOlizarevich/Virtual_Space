"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { cartItemSchema, persistedCartSchema } from "@/modules/cart/schemas";
import type { AddCartItemInput, CartItem } from "@/modules/cart/types";

export const CART_STORAGE_KEY = "virtual-space:guest-cart:v1";

type CartState = {
  items: readonly CartItem[];
  addItem: (input: AddCartItemInput) => boolean;
};

function getItemKey(item: Pick<CartItem, "productId" | "selectedOptions">) {
  const options = item.selectedOptions
    .map(({ groupId, optionId }) => `${groupId}:${optionId}`)
    .toSorted()
    .join("|");
  return `${item.productId}|${options}`;
}

const safeLocalStorage: StateStorage = {
  getItem(name) {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // The in-memory cart remains usable when storage is unavailable or full.
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Removing persisted state is best-effort for restricted browsers.
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem(input) {
        const parsed = cartItemSchema.safeParse({ ...input, quantity: input.quantity ?? 1 });
        if (!parsed.success) return false;

        set((state) => {
          const itemKey = getItemKey(parsed.data);
          const existingIndex = state.items.findIndex((item) => getItemKey(item) === itemKey);

          if (existingIndex === -1) {
            if (state.items.length >= 100) return state;
            return { items: [...state.items, parsed.data] };
          }

          return {
            items: state.items.map((item, index) =>
              index === existingIndex
                ? {
                    ...item,
                    quantity: Math.min(99, item.quantity + parsed.data.quantity),
                    observedPrice: parsed.data.observedPrice,
                  }
                : item,
            ),
          };
        });
        return true;
      },
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: ({ items }) => ({ items }),
      merge: (persistedState, currentState) => {
        const parsed = persistedCartSchema.safeParse(persistedState);
        return parsed.success ? { ...currentState, items: parsed.data.items } : currentState;
      },
    },
  ),
);
