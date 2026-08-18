"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ADMIN_PREVIEW_SESSION_KEY = "virtual-space:admin-preview-session:v1";

type AdminPreviewSession = {
  authenticated: boolean;
  pending: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AdminSessionContext = createContext<AdminPreviewSession | null>(null);

export function AdminPreviewSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setAuthenticated(window.sessionStorage.getItem(ADMIN_PREVIEW_SESSION_KEY) === "admin");
      setPending(false);
    });
  }, []);

  function signIn() {
    window.sessionStorage.setItem(ADMIN_PREVIEW_SESSION_KEY, "admin");
    setAuthenticated(true);
  }

  function signOut() {
    window.sessionStorage.removeItem(ADMIN_PREVIEW_SESSION_KEY);
    setAuthenticated(false);
  }

  return (
    <AdminSessionContext.Provider value={{ authenticated, pending, signIn, signOut }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminPreviewSession() {
  const session = useContext(AdminSessionContext);
  if (!session) throw new Error("useAdminPreviewSession must be used inside its provider.");
  return session;
}
