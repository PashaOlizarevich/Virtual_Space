"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { saveServerCartPreview, synchronizeCartPreview } from "@/modules/cart/mock-transport";
import { useCartStore } from "@/modules/cart/store";

const PREVIEW_SESSION_KEY = "virtual-space:preview-session:v1";

type PreviewSession = {
  authenticated: boolean;
  pending: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const previewSessionFallback: PreviewSession = {
  authenticated: false,
  pending: false,
  error: null,
  signIn: async () => undefined,
  signOut: async () => undefined,
};

const SessionContext = createContext<PreviewSession>(previewSessionFallback);

export function PreviewSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const suppressNextSync = useRef(false);

  async function restoreOrSignIn() {
    setPending(true);
    setError(null);
    try {
      const merged = await synchronizeCartPreview(useCartStore.getState().items);
      useCartStore.getState().replaceItems(merged);
      window.sessionStorage.setItem(PREVIEW_SESSION_KEY, "authenticated");
      setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось синхронизировать корзину.");
      throw reason;
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    setPending(true);
    setError(null);
    try {
      await saveServerCartPreview(useCartStore.getState().items);
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      suppressNextSync.current = true;
      useCartStore.getState().clearCart();
      setAuthenticated(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось выйти из аккаунта.");
      throw reason;
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      if (window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === "authenticated") {
        void restoreOrSignIn().catch(() => undefined);
      } else {
        setPending(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    return useCartStore.subscribe((state) => {
      if (suppressNextSync.current) {
        suppressNextSync.current = false;
        return;
      }
      void saveServerCartPreview(state.items).catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Не удалось сохранить корзину.");
      });
    });
  }, [authenticated]);

  return (
    <SessionContext.Provider
      value={{ authenticated, pending, error, signIn: restoreOrSignIn, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function usePreviewSession() {
  return useContext(SessionContext);
}
