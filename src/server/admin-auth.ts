import "server-only";

import {
  AuthenticationRequiredError,
  authorizeAdminOperation,
  resolveAdminPrincipal,
  type AdminOperation,
  type AdminPrincipal,
} from "@/server/admin-access";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-access";
export type { AdminPrincipal } from "@/server/admin-access";

export async function requireAdmin(): Promise<AdminPrincipal> {
  const session = await auth();
  if (typeof session?.user?.credentialsVersion !== "number") {
    throw new AuthenticationRequiredError();
  }
  return resolveAdminPrincipal(session, (id) =>
    db.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, credentialsVersion: true, deletedAt: true },
    }),
  );
}

/**
 * Wrap every protected Route Handler, Server Action, or administrative mutation
 * at its exported server boundary. The current database role is checked before
 * any input reaches the operation.
 */
export function withAdminAuthorization<Arguments extends readonly unknown[], Result>(
  operation: AdminOperation<Arguments, Result>,
): (...args: Arguments) => Promise<Result> {
  return (...args) => authorizeAdminOperation(requireAdmin, operation, ...args);
}
