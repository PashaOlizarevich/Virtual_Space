import "server-only";

import { resolveAdminPrincipal, type AdminPrincipal } from "@/server/admin-access";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-access";
export type { AdminPrincipal } from "@/server/admin-access";

export async function requireAdmin(): Promise<AdminPrincipal> {
  const session = await auth();
  return resolveAdminPrincipal(session, (id) =>
    db.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    }),
  );
}
