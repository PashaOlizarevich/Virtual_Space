import "server-only";

import { auth } from "@/server/auth";
import { db } from "@/server/db";

export class UserAuthenticationRequiredError extends Error {}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UserAuthenticationRequiredError("Authentication required");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      credentialsVersion: true,
      deletedAt: true,
    },
  });
  if (!user || user.deletedAt || user.credentialsVersion !== session.user.credentialsVersion) {
    throw new UserAuthenticationRequiredError("Authentication required");
  }
  return user;
}
