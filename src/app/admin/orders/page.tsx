import type { Metadata } from "next";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminOrdersManager } from "@/modules/admin/components/admin-orders-manager";
import { mapAdminOrderPage } from "@/modules/admin/orders-transport";
import { getAdminOrders } from "@/modules/orders/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Заказы — панель администратора" };

async function loadPageData() {
  try {
    return {
      authenticated: true as const,
      orders: mapAdminOrderPage(await getAdminOrders({ limit: 50 })),
    };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof AdminAccessRequiredError) {
      return { authenticated: false as const };
    }
    throw error;
  }
}

export default async function AdminOrdersPage() {
  const result = await loadPageData();
  return result.authenticated ? (
    <AdminOrdersManager initialOrders={result.orders} />
  ) : (
    <AdminLoginForm />
  );
}
