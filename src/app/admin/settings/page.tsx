import type { Metadata } from "next";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminSettingsManager } from "@/modules/admin/components/admin-settings-manager";
import { loadAdminSettingsAction } from "@/modules/admin/server/actions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const metadata: Metadata = { title: "Настройки — панель администратора" };

async function loadPageData() {
  try {
    return { authenticated: true as const, data: await loadAdminSettingsAction() };
  } catch (error) {
    if (error instanceof AuthenticationRequiredError || error instanceof AdminAccessRequiredError) {
      return { authenticated: false as const };
    }
    throw error;
  }
}

export default async function AdminSettingsPage() {
  const result = await loadPageData();
  return result.authenticated ? (
    <AdminSettingsManager initialSettings={result.data} />
  ) : (
    <AdminLoginForm />
  );
}
