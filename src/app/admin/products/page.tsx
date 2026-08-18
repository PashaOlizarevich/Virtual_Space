import type { Metadata } from "next";

import { AdminProductsGate } from "@/modules/admin/components/admin-products-gate";

export const metadata: Metadata = { title: "Товары — панель администратора" };

export default function AdminProductsPage() {
  return <AdminProductsGate />;
}
