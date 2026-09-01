import "server-only";

import { profileUpdateSchema } from "@/modules/users/schemas";
import { db } from "@/server/db";
import { requireUser } from "@/server/user-auth";

export class ProfileInputError extends Error {}
export class ProfileEmailConflictError extends Error {}

function toProfileDto(user: { name: string | null; email: string; phone: string | null }) {
  return { name: user.name ?? "", email: user.email, phone: user.phone ?? "" };
}

export async function getOwnProfile() {
  return toProfileDto(await requireUser());
}

export async function updateOwnProfile(input: unknown) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) throw new ProfileInputError("Invalid profile input");
  const principal = await requireUser();

  try {
    const user = await db.user.update({
      where: { id: principal.id, deletedAt: null },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.trim().toLowerCase(),
        phone: parsed.data.phone,
      },
      select: { name: true, email: true, phone: true },
    });
    return toProfileDto(user);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      throw new ProfileEmailConflictError("Email is already registered");
    }
    throw error;
  }
}
