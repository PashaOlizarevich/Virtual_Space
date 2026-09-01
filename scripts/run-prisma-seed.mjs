import { execFileSync } from "node:child_process";
import path from "node:path";

if (process.env.NODE_ENV === "production") {
  console.error("Database seed is disabled in production.");
  process.exit(1);
}

const tsxCliPath = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

execFileSync(process.execPath, [tsxCliPath, "prisma/seed.ts"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});
