import { describe, expect, it } from "@jest/globals";

import { getPostLoginUrl, sanitizeCallbackUrl } from "@/modules/auth/login-redirect";

describe("sanitizeCallbackUrl", () => {
  it.each(["https://evil.example", "//evil.example/admin", "/\\evil.example/admin", "admin"])(
    "rejects an unsafe callback: %s",
    (callbackUrl) => {
      expect(sanitizeCallbackUrl(callbackUrl)).toBeNull();
    },
  );

  it("preserves a local path, query, and fragment", () => {
    expect(sanitizeCallbackUrl("/admin/orders?status=new#latest")).toBe(
      "/admin/orders?status=new#latest",
    );
  });
});

describe("getPostLoginUrl", () => {
  it("uses role-specific defaults", () => {
    expect(getPostLoginUrl("ADMIN")).toBe("/admin");
    expect(getPostLoginUrl("USER")).toBe("/profile");
  });

  it("returns an administrator to the requested admin page", () => {
    expect(getPostLoginUrl("ADMIN", "/admin/orders?status=new")).toBe("/admin/orders?status=new");
  });

  it("does not send a regular user into the admin area", () => {
    expect(getPostLoginUrl("USER", "/admin/settings")).toBe("/profile");
    expect(getPostLoginUrl("USER", "/admin?view=summary")).toBe("/profile");
  });
});
