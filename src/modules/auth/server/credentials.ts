import "server-only";

import { z } from "zod";

import { db } from "@/server/db";
import { verifyPassword } from "@/modules/auth/server/password";

// Auth.js adds its own callback/CSRF fields to the POST body. Zod strips them so
// only this allowlist reaches the credential lookup.
export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

const DUMMY_PASSWORD_HASH =
  "scrypt-v1$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function authorizeCredentials(credentials: unknown) {
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      passwordHash: true,
      role: true,
      credentialsVersion: true,
      deletedAt: true,
    },
  });
  const passwordMatches = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || user.deletedAt || !user.passwordHash || !passwordMatches) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    credentialsVersion: user.credentialsVersion,
  };
}

export const adminCredentialsSchema = credentialsSchema;

export async function authorizeAdminCredentials(credentials: unknown) {
  const user = await authorizeCredentials(credentials);
  if (user?.role !== "ADMIN") return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  };
}
