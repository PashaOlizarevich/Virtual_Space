import { defineConfig } from "prisma/config";

const directDatabaseUrl = process.env.DATABASE_URL_UNPOOLED;

if (!directDatabaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL_UNPOOLED");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directDatabaseUrl,
  },
});
