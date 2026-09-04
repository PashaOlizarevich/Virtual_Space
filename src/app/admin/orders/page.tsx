import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessDenied } from "@/modules/admin/components/admin-access-denied";
import { AdminOrdersManager } from "@/modules/admin/components/admin-orders-manager";
import { mapAdminOrderPage } from "@/modules/admin/orders-transport";
import { getAdminOrders } from "@/modules/orders/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Заказы — панель администратора" };

async function loadPageData() {
  try {
    return {
      authorized: true as const,
      orders: mapAdminOrderPage(await getAdminOrders({ limit: 50 })),
    };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError)
      redirect("/login?callbackUrl=%2Fadmin%2Forders");
    if (error instanceof AdminAccessRequiredError) return { authorized: false as const };
    throw error;
  }
}

export default async function AdminOrdersPage() {
  const result = await loadPageData();
  return result.authorized ? (
    <AdminOrdersManager initialOrders={result.orders} />
  ) : (
    <AdminAccessDenied />
  );
}
