import type { Metadata } from "next";

import { AdminDashboard } from "@/modules/admin/components/admin-dashboard";
import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
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
    return { authenticated: true as const, data: { products, activeProducts, outOfStock } };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof AdminAccessRequiredError) {
      return { authenticated: false as const };
    }
    throw error;
  }
}

export default async function AdminPage() {
  const result = await loadDashboard();
  return result.authenticated ? <AdminDashboard data={result.data} /> : <AdminLoginForm />;
}
