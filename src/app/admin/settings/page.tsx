import type { Metadata } from "next";

import { AdminSettingsGate } from "@/modules/admin/components/admin-settings-gate";

export const metadata: Metadata = { title: "Настройки — панель администратора" };

export default function AdminSettingsPage() {
  return <AdminSettingsGate />;
}
