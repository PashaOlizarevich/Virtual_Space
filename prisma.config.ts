import { defineConfig } from "prisma/config";

const directDatabaseUrl = process.env.DATABASE_URL_UNPOOLED;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/run-prisma-seed.mjs",
  },
  ...(directDatabaseUrl
    ? {
        datasource: {
          url: directDatabaseUrl,
        },
      }
    : {}),
});
