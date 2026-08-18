import type { Metadata } from "next";

import { AdminGate } from "@/modules/admin/components/admin-gate";

export const metadata: Metadata = { title: "Панель администратора" };

export default function AdminPage() {
  return <AdminGate />;
}
