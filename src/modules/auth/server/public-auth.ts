import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { recoverySchema, registrationSchema, resetPasswordSchema } from "@/modules/auth/schemas";
import { hashPassword } from "@/modules/auth/server/password";
import { db } from "@/server/db";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export class AuthInputError extends Error {}
export class EmailAlreadyRegisteredError extends Error {}
export class InvalidPasswordResetTokenError extends Error {}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("base64url");
}

function isUniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function registerUser(input: unknown) {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) throw new AuthInputError("Invalid registration input");

  const passwordHash = await hashPassword(parsed.data.password);
  try {
    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: normalizeEmail(parsed.data.email),
        passwordHash,
        role: "USER",
      },
      select: { id: true, name: true, email: true },
    });
    return user;
  } catch (error) {
    if (isUniqueConflict(error))
      throw new EmailAlreadyRegisteredError("Email is already registered");
    throw error;
  }
}

export type PasswordResetDelivery = Readonly<{
  email: string;
  token: string;
  expiresAt: Date;
}>;

/** Server-only handoff: the raw token must go directly to the selected delivery adapter. */
export async function createPasswordReset(input: unknown): Promise<PasswordResetDelivery | null> {
  const parsed = recoverySchema.safeParse(input);
  if (!parsed.success) throw new AuthInputError("Invalid recovery input");

  const user = await db.user.findUnique({
    where: { email: normalizeEmail(parsed.data.email) },
    select: { id: true, email: true, passwordHash: true, deletedAt: true },
  });
  if (!user || !user.passwordHash || user.deletedAt) return null;

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt },
    }),
  ]);

  return { email: user.email, token, expiresAt };
}

export async function resetPassword(input: unknown) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) throw new AuthInputError("Invalid reset input");

  const tokenHash = hashResetToken(parsed.data.token);
  const existingToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, expiresAt: true },
  });
  if (!existingToken || existingToken.expiresAt <= new Date()) {
    if (existingToken) await db.passwordResetToken.delete({ where: { id: existingToken.id } });
    throw new InvalidPasswordResetTokenError("Reset token is invalid or expired");
  }
  const passwordHash = await hashPassword(parsed.data.password);
  return db.$transaction(async (transaction) => {
    const resetToken = await transaction.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });
    if (!resetToken || resetToken.expiresAt <= new Date()) {
      throw new InvalidPasswordResetTokenError("Reset token is invalid or expired");
    }

    const consumed = await transaction.passwordResetToken.deleteMany({
      where: { id: resetToken.id, tokenHash },
    });
    if (consumed.count !== 1) throw new InvalidPasswordResetTokenError("Reset token was consumed");

    await transaction.user.update({
      where: { id: resetToken.userId, deletedAt: null },
      data: { passwordHash, credentialsVersion: { increment: 1 } },
      select: { id: true },
    });
    await transaction.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
    return { reset: true as const };
  });
}
