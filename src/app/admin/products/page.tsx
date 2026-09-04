import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessDenied } from "@/modules/admin/components/admin-access-denied";
import { AdminProductsManager } from "@/modules/admin/components/admin-products-manager";
import { loadAdminCatalog } from "@/modules/admin/server/actions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Товары — панель администратора" };

async function loadPageData() {
  try {
    return { authorized: true as const, data: await loadAdminCatalog() };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError)
      redirect("/login?callbackUrl=%2Fadmin%2Fproducts");
    if (error instanceof AdminAccessRequiredError) return { authorized: false as const };
    throw error;
  }
}

export default async function AdminProductsPage() {
  const result = await loadPageData();
  return result.authorized ? (
    <AdminProductsManager initialData={result.data} />
  ) : (
    <AdminAccessDenied />
  );
}
