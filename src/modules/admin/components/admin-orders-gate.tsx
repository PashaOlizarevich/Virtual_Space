"use client";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminOrdersManager } from "@/modules/admin/components/admin-orders-manager";
import {
  AdminPreviewSessionProvider,
  useAdminPreviewSession,
} from "@/modules/admin/session-provider";

function AdminOrdersGateContent() {
  const session = useAdminPreviewSession();

  if (session.pending) {
    return (
      <main className="admin-session-loading" aria-busy="true" aria-live="polite">
        <p>Проверяем административную сессию…</p>
      </main>
    );
  }

  return session.authenticated ? <AdminOrdersManager /> : <AdminLoginForm />;
}

export function AdminOrdersGate() {
  return (
    <AdminPreviewSessionProvider>
      <AdminOrdersGateContent />
    </AdminPreviewSessionProvider>
  );
}
