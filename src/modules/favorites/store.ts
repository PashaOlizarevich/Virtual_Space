"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import {
  favoriteProductIdSchema,
  MAX_FAVORITES,
  persistedFavoritesSchema,
} from "@/modules/favorites/schemas";

export const FAVORITES_STORAGE_KEY = "virtual-space:guest-favorites:v1";

type FavoritesState = {
  productIds: readonly string[];
  replace: (productIds: readonly string[]) => boolean;
  toggle: (productId: string) => boolean;
};

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
      // In-memory favorites remain usable when browser storage is unavailable.
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Removing persisted state is best-effort in restricted browsers.
    }
  },
};

function uniqueProductIds(productIds: readonly string[]) {
  return [...new Set(productIds)];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      productIds: [],
      replace(productIds) {
        const parsed = persistedFavoritesSchema.safeParse({
          productIds: uniqueProductIds(productIds),
        });
        if (!parsed.success) return false;
        set({ productIds: parsed.data.productIds });
        return true;
      },
      toggle(productId) {
        const parsed = favoriteProductIdSchema.safeParse(productId);
        if (!parsed.success) return false;

        let changed = false;
        set((state) => {
          if (state.productIds.includes(parsed.data)) {
            changed = true;
            return { productIds: state.productIds.filter((id) => id !== parsed.data) };
          }
          if (state.productIds.length >= MAX_FAVORITES) return state;
          changed = true;
          return { productIds: [...state.productIds, parsed.data] };
        });
        return changed;
      },
    }),
    {
      name: FAVORITES_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: ({ productIds }) => ({ productIds }),
      merge: (persistedState, currentState) => {
        const parsed = persistedFavoritesSchema.safeParse(persistedState);
        return parsed.success
          ? { ...currentState, productIds: uniqueProductIds(parsed.data.productIds) }
          : currentState;
      },
    },
  ),
);
