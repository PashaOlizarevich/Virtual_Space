import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessDenied } from "@/modules/admin/components/admin-access-denied";
import { AdminDashboard } from "@/modules/admin/components/admin-dashboard";
import {
  AdminAccessRequiredError,
  AuthenticationRequiredError,
  requireAdmin,
} from "@/server/admin-auth";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Панель администратора" };

async function loadDashboard() {
  try {
    await requireAdmin();
    const [products, activeProducts, outOfStock] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.product.count({ where: { stock: 0 } }),
    ]);
    return { authorized: true as const, data: { products, activeProducts, outOfStock } };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) redirect("/login?callbackUrl=%2Fadmin");
    if (error instanceof AdminAccessRequiredError) return { authorized: false as const };
    throw error;
  }
}

export default async function AdminPage() {
  const result = await loadDashboard();
  return result.authorized === false ? (
    <AdminAccessDenied />
  ) : (
    <AdminDashboard data={result.data} />
  );
}
