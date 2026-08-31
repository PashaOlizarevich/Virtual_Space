import type { Metadata } from "next";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminProductsManager } from "@/modules/admin/components/admin-products-manager";
import { loadAdminCatalog } from "@/modules/admin/server/actions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Товары — панель администратора" };

async function loadPageData() {
  try {
    return { authenticated: true as const, data: await loadAdminCatalog() };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof AdminAccessRequiredError) {
      return { authenticated: false as const };
    }
    throw error;
  }
}

export default async function AdminProductsPage() {
  const result = await loadPageData();
  return result.authenticated ? (
    <AdminProductsManager initialData={result.data} />
  ) : (
    <AdminLoginForm />
  );
}
