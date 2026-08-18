"use client";

import { AdminLoginForm } from "@/modules/admin/components/admin-login-form";
import { AdminProductsManager } from "@/modules/admin/components/admin-products-manager";
import {
  AdminPreviewSessionProvider,
  useAdminPreviewSession,
} from "@/modules/admin/session-provider";

function AdminProductsGateContent() {
  const session = useAdminPreviewSession();
  if (session.pending)
    return (
      <main className="admin-session-loading" aria-busy="true" aria-live="polite">
        <p>Проверяем административную сессию…</p>
      </main>
    );
  return session.authenticated ? <AdminProductsManager /> : <AdminLoginForm />;
}

export function AdminProductsGate() {
  return (
    <AdminPreviewSessionProvider>
      <AdminProductsGateContent />
    </AdminPreviewSessionProvider>
  );
}
