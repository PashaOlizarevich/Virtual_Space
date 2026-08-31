import "server-only";

import { z } from "zod";

import { hashPassword } from "@/modules/auth/server/password";

const firstAdminEnvironmentSchema = z.strictObject({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
  name: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined),
});

const FIRST_ADMIN_LOCK_KEY = 1_449_354_278;

export type FirstAdminResult = { status: "created" } | { status: "already-exists" };
type FirstAdminInput = { email: string; password: string; name?: string };
type FirstAdminTransaction = {
  $executeRawUnsafe(query: string): Promise<unknown>;
  user: {
    findFirst(args: {
      where: { role: "ADMIN" };
      select: { id: true };
    }): Promise<{ id: string } | null>;
    findUnique(args: {
      where: { email: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
    create(args: {
      data: { email: string; name?: string; passwordHash: string; role: "ADMIN" };
      select: { id: true };
    }): Promise<{ id: string }>;
  };
};
type TransactionExecutor = <Result>(
  operation: (transaction: FirstAdminTransaction) => Promise<Result>,
) => Promise<Result>;

export class InvalidFirstAdminConfigurationError extends Error {
  constructor(readonly fields: readonly string[]) {
    super(`Invalid first administrator configuration: ${fields.join(", ")}`);
    this.name = "InvalidFirstAdminConfigurationError";
  }
}

export class FirstAdminEmailConflictError extends Error {
  constructor() {
    super("A user with the configured email already exists.");
    this.name = "FirstAdminEmailConflictError";
  }
}

export function parseFirstAdminEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  const parsed = firstAdminEnvironmentSchema.safeParse({
    email: environment.FIRST_ADMIN_EMAIL,
    password: environment.FIRST_ADMIN_PASSWORD,
    name: environment.FIRST_ADMIN_NAME,
  });

  if (!parsed.success) {
    throw new InvalidFirstAdminConfigurationError([
      ...new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
    ]);
  }

  return parsed.data;
}

export async function createFirstAdmin(
  executeTransaction: TransactionExecutor,
  input: FirstAdminInput,
  createPasswordHash: (password: string) => Promise<string> = hashPassword,
): Promise<FirstAdminResult> {
  return executeTransaction(async (transaction) => {
    await transaction.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${FIRST_ADMIN_LOCK_KEY})`);

    const existingAdmin = await transaction.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (existingAdmin) return { status: "already-exists" };

    const emailOwner = await transaction.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (emailOwner) throw new FirstAdminEmailConflictError();

    const passwordHash = await createPasswordHash(input.password);
    await transaction.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: "ADMIN",
      },
      select: { id: true },
    });

    return { status: "created" };
  });
}
