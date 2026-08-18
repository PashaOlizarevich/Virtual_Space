import type { Metadata } from "next";

import { AdminOrdersGate } from "@/modules/admin/components/admin-orders-gate";

export const metadata: Metadata = { title: "Заказы — панель администратора" };

export default function AdminOrdersPage() {
  return <AdminOrdersGate />;
}
