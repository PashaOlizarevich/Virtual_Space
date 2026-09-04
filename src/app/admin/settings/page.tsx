import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminAccessDenied } from "@/modules/admin/components/admin-access-denied";
import { AdminSettingsManager } from "@/modules/admin/components/admin-settings-manager";
import { loadAdminSettingsAction } from "@/modules/admin/server/actions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Настройки — панель администратора" };

async function loadPageData() {
  try {
    return { authorized: true as const, data: await loadAdminSettingsAction() };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError)
      redirect("/login?callbackUrl=%2Fadmin%2Fsettings");
    if (error instanceof AdminAccessRequiredError) return { authorized: false as const };
    throw error;
  }
}

export default async function AdminSettingsPage() {
  const result = await loadPageData();
  return result.authorized ? (
    <AdminSettingsManager initialSettings={result.data} />
  ) : (
    <AdminAccessDenied />
  );
}
