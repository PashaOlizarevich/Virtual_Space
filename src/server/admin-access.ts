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

interface SessionIdentity {
  user?: { id?: string };
}

interface StoredIdentity {
  id: string;
  email: string;
  role: UserRole;
}

export async function resolveAdminPrincipal(
  session: SessionIdentity | null,
  findUser: (id: string) => Promise<StoredIdentity | null>,
): Promise<AdminPrincipal> {
  if (!session?.user?.id) throw new AuthenticationRequiredError();
  const user = await findUser(session.user.id);
  if (!user || user.role !== "ADMIN") throw new AdminAccessRequiredError();
  return { id: user.id, email: user.email, role: "ADMIN" };
}
