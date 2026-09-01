import type { UserRole } from "@prisma/client";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthenticationRequiredError";
  }
}

export class AdminAccessRequiredError extends Error {
  constructor() {
    super("Administrator access required");
    this.name = "AdminAccessRequiredError";
  }
}

export interface AdminPrincipal {
  id: string;
  email: string;
  role: "ADMIN";
}

export type AdminOperation<Arguments extends readonly unknown[], Result> = (
  principal: AdminPrincipal,
  ...args: Arguments
) => Promise<Result> | Result;

interface SessionIdentity {
  user?: { id?: string; credentialsVersion?: number };
}

interface StoredIdentity {
  id: string;
  email: string;
  role: UserRole;
  credentialsVersion?: number;
  deletedAt?: Date | null;
}

export async function resolveAdminPrincipal(
  session: SessionIdentity | null,
  findUser: (id: string) => Promise<StoredIdentity | null>,
): Promise<AdminPrincipal> {
  if (!session?.user?.id) throw new AuthenticationRequiredError();
  const user = await findUser(session.user.id);
  if (
    !user ||
    user.deletedAt ||
    user.role !== "ADMIN" ||
    (typeof session.user.credentialsVersion === "number" &&
      typeof user.credentialsVersion === "number" &&
      session.user.credentialsVersion !== user.credentialsVersion)
  ) {
    throw new AdminAccessRequiredError();
  }
  return { id: user.id, email: user.email, role: "ADMIN" };
}

export async function authorizeAdminOperation<Arguments extends readonly unknown[], Result>(
  getPrincipal: () => Promise<AdminPrincipal>,
  operation: AdminOperation<Arguments, Result>,
  ...args: Arguments
): Promise<Result> {
  const principal = await getPrincipal();
  return operation(principal, ...args);
}
