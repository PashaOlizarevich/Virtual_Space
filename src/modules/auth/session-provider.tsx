"use client";

import { signOut as authSignOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { UserSessionContext } from "@/modules/auth/session-context";
import {
  removeServerCartItemAction,
  updateServerCartItemQuantityAction,
} from "@/modules/cart/server/actions";
import { mergeGuestCartAction } from "@/modules/cart/server/merge-action";
import { cartItemKey, mapServerCartToLocal } from "@/modules/cart/server-cart-adapter";
import { useCartStore } from "@/modules/cart/store";
import type { CartItem } from "@/modules/cart/types";

function actionError(code: string) {
  if (code === "UNAUTHENTICATED") return "Сессия завершилась. Войдите снова.";
  if (code === "CART_CONFLICT") return "Не удалось объединить корзины: проверьте наличие товаров.";
  return "Не удалось синхронизировать корзину с сервером.";
}

export function UserSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const session = useSession();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serverItems = useRef<readonly CartItem[]>([]);
  const suppressSubscription = useRef(false);
  const readyToSync = useRef(false);
  const syncQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (session.status !== "authenticated") return;

    let active = true;
    async function synchronizeInitialCart() {
      setSyncing(true);
      setError(null);
      readyToSync.current = false;
      const guestItems = useCartStore
        .getState()
        .items.filter(({ productId }) => /^[1-9]\d*$/.test(productId));

      try {
        const result = await mergeGuestCartAction({
          items: guestItems.map(({ productId, quantity, selectedOptions }) => ({
            productId,
            quantity,
            selectedOptions,
          })),
        });
        if (!active) return;
        if (!result.ok) {
          setError(actionError(result.code));
          return;
        }

        const merged = mapServerCartToLocal(result.cart);
        serverItems.current = merged;
        suppressSubscription.current = true;
        useCartStore.getState().replaceItems(merged);
        readyToSync.current = true;
      } catch {
        if (active) setError(actionError("INTERNAL_ERROR"));
      } finally {
        if (active) setSyncing(false);
      }
    }

    void synchronizeInitialCart();

    return () => {
      active = false;
    };
  }, [session.status]);

  useEffect(() => {
    if (session.status !== "authenticated") return;

    return useCartStore.subscribe((state) => {
      if (!readyToSync.current) return;
      if (suppressSubscription.current) {
        suppressSubscription.current = false;
        return;
      }

      const desired = state.items;
      syncQueue.current = syncQueue.current.then(async () => {
        setSyncing(true);
        setError(null);
        try {
          let current = serverItems.current;
          const desiredByKey = new Map(desired.map((item) => [cartItemKey(item), item]));

          for (const item of current) {
            if (desiredByKey.has(cartItemKey(item))) continue;
            const result = await removeServerCartItemAction({
              productId: item.productId,
              selectedOptions: item.selectedOptions,
            });
            if (!result.ok) throw new Error(actionError(result.code));
            current = mapServerCartToLocal(result.cart);
          }

          for (const item of desired) {
            const existing = current.find(
              (candidate) => cartItemKey(candidate) === cartItemKey(item),
            );
            const result = existing
              ? existing.quantity === item.quantity
                ? null
                : await updateServerCartItemQuantityAction({
                    productId: item.productId,
                    selectedOptions: item.selectedOptions,
                    quantity: item.quantity,
                  })
              : await mergeGuestCartAction({
                  items: [
                    {
                      productId: item.productId,
                      selectedOptions: item.selectedOptions,
                      quantity: item.quantity,
                    },
                  ],
                });
            if (result && !result.ok) throw new Error(actionError(result.code));
            if (result?.ok) current = mapServerCartToLocal(result.cart);
          }

          serverItems.current = current;
          suppressSubscription.current = true;
          useCartStore.getState().replaceItems(current);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : actionError("INTERNAL_ERROR"));
        } finally {
          setSyncing(false);
        }
      });
    });
  }, [session.status]);

  async function signOut() {
    setSyncing(true);
    setError(null);
    try {
      await syncQueue.current;
      await authSignOut({ redirect: false });
      serverItems.current = [];
      suppressSubscription.current = true;
      useCartStore.getState().clearCart();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось выйти из аккаунта.");
      throw reason;
    } finally {
      setSyncing(false);
    }
  }

  return (
    <UserSessionContext.Provider
      value={{
        authenticated: session.status === "authenticated",
        pending: session.status === "loading" || syncing,
        error,
        signOut,
      }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}
