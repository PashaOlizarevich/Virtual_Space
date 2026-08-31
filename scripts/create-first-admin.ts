import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import {
  createFirstAdmin,
  FirstAdminEmailConflictError,
  InvalidFirstAdminConfigurationError,
  parseFirstAdminEnvironment,
} from "../src/modules/auth/server/first-admin";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

async function main(): Promise<void> {
  if (!databaseUrl) {
    throw new InvalidFirstAdminConfigurationError(["DATABASE_URL_UNPOOLED"]);
  }

  const input = parseFirstAdminEnvironment(process.env);
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const result = await createFirstAdmin(
      (operation) => client.$transaction((transaction) => operation(transaction)),
      input,
    );
    console.info(
      result.status === "created"
        ? "First administrator created. Remove the bootstrap secrets and verify sign-in."
        : "An administrator already exists; no changes were made.",
    );
  } finally {
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof InvalidFirstAdminConfigurationError) {
    console.error(`First administrator configuration is invalid: ${error.fields.join(", ")}.`);
  } else if (error instanceof FirstAdminEmailConflictError) {
    console.error("The configured email belongs to an existing user; no changes were made.");
  } else {
    console.error("First administrator creation failed; no credentials were logged.");
  }
  process.exitCode = 1;
});
