"use client";

import { useSyncExternalStore } from "react";

import { useFavoritesStore } from "@/modules/favorites/store";

const subscribe = (onStoreChange: () => void) =>
  useFavoritesStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useFavoritesStore.persist.hasHydrated();
const getServerSnapshot = () => false;

export function useFavoritesHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
