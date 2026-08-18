"use client";

import { AdminDashboard } from "@/modules/admin/components/admin-dashboard";
import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import {
  AdminPreviewSessionProvider,
  useAdminPreviewSession,
} from "@/modules/admin/session-provider";

function AdminGateContent() {
  const session = useAdminPreviewSession();

  if (session.pending) {
    return (
      <main className="admin-session-loading" aria-busy="true" aria-live="polite">
        <p>Проверяем административную сессию…</p>
      </main>
    );
  }

  return session.authenticated ? <AdminDashboard /> : <AdminLoginForm />;
}

export function AdminGate() {
  return (
    <AdminPreviewSessionProvider>
      <AdminGateContent />
    </AdminPreviewSessionProvider>
  );
}
