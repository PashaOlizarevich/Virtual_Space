export type LoginRole = "USER" | "ADMIN";

export function sanitizeCallbackUrl(candidate?: string): string | null {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return null;

  try {
    const url = new URL(candidate, "https://virtual-space.local");
    if (url.origin !== "https://virtual-space.local") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getPostLoginUrl(role: LoginRole, callbackUrl?: string): string {
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);
  const callbackPath = safeCallbackUrl?.split(/[?#]/, 1)[0];
  const targetsAdmin = callbackPath === "/admin" || callbackPath?.startsWith("/admin/");

  if (safeCallbackUrl && (!targetsAdmin || role === "ADMIN")) return safeCallbackUrl;
  return role === "ADMIN" ? "/admin" : "/profile";
}
