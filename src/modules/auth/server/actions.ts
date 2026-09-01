"use server";

import {
  AuthInputError,
  EmailAlreadyRegisteredError,
  InvalidPasswordResetTokenError,
  registerUser,
  resetPassword,
} from "@/modules/auth/server/public-auth";

export type AuthMutationResult =
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      code: "INVALID_INPUT" | "EMAIL_CONFLICT" | "INVALID_TOKEN" | "INTERNAL_ERROR";
    }>;

export async function registerUserAction(input: unknown): Promise<AuthMutationResult> {
  try {
    await registerUser(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthInputError) return { ok: false, code: "INVALID_INPUT" };
    if (error instanceof EmailAlreadyRegisteredError) return { ok: false, code: "EMAIL_CONFLICT" };
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}

export async function resetPasswordAction(input: unknown): Promise<AuthMutationResult> {
  try {
    await resetPassword(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthInputError) return { ok: false, code: "INVALID_INPUT" };
    if (error instanceof InvalidPasswordResetTokenError) {
      return { ok: false, code: "INVALID_TOKEN" };
    }
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}
