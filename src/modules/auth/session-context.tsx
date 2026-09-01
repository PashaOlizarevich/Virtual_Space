"use client";

import { createContext, useContext } from "react";

export type UserSession = {
  authenticated: boolean;
  pending: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

export const UserSessionContext = createContext<UserSession>({
  authenticated: false,
  pending: true,
  error: null,
  signOut: async () => undefined,
});

export function useUserSession() {
  return useContext(UserSessionContext);
}
