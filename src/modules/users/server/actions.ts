"use server";

import {
  ProfileEmailConflictError,
  ProfileInputError,
  getOwnProfile,
  updateOwnProfile,
} from "@/modules/users/server/profile";
import { UserAuthenticationRequiredError } from "@/server/user-auth";

type ProfileDto = Awaited<ReturnType<typeof getOwnProfile>>;
export type ProfileActionResult =
  | Readonly<{ ok: true; profile: ProfileDto }>
  | Readonly<{
      ok: false;
      code: "UNAUTHENTICATED" | "INVALID_INPUT" | "EMAIL_CONFLICT" | "INTERNAL_ERROR";
    }>;

function mapProfileError(error: unknown): ProfileActionResult {
  if (error instanceof UserAuthenticationRequiredError) {
    return { ok: false, code: "UNAUTHENTICATED" };
  }
  if (error instanceof ProfileInputError) return { ok: false, code: "INVALID_INPUT" };
  if (error instanceof ProfileEmailConflictError) return { ok: false, code: "EMAIL_CONFLICT" };
  return { ok: false, code: "INTERNAL_ERROR" };
}

export async function getOwnProfileAction(): Promise<ProfileActionResult> {
  try {
    return { ok: true, profile: await getOwnProfile() };
  } catch (error) {
    return mapProfileError(error);
  }
}

export async function updateOwnProfileAction(input: unknown): Promise<ProfileActionResult> {
  try {
    return { ok: true, profile: await updateOwnProfile(input) };
  } catch (error) {
    return mapProfileError(error);
  }
}
