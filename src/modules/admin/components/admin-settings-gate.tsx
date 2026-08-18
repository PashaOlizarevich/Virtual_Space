"use client";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminSettingsManager } from "@/modules/admin/components/admin-settings-manager";
import {
  AdminPreviewSessionProvider,
  useAdminPreviewSession,
} from "@/modules/admin/session-provider";

function AdminSettingsGateContent() {
  const session = useAdminPreviewSession();

  if (session.pending) {
    return (
      <main className="admin-session-loading" aria-busy="true" aria-live="polite">
        <p>Проверяем административную сессию…</p>
      </main>
    );
  }

  return session.authenticated ? <AdminSettingsManager /> : <AdminLoginForm />;
}

export function AdminSettingsGate() {
  return (
    <AdminPreviewSessionProvider>
      <AdminSettingsGateContent />
    </AdminPreviewSessionProvider>
  );
}
