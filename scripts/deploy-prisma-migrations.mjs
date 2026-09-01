import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const prismaCliPath = path.join(projectRoot, "node_modules", "prisma", "build", "index.js");
const commitPattern = /^[0-9a-f]{40}$/;

function fail(message) {
  console.error(`Migration deploy refused: ${message}`);
  process.exit(1);
}

function readOptions(args) {
  const options = new Map();

  for (const argument of args) {
    if (argument === "--dry-run") {
      options.set("dry-run", "true");
      continue;
    }

    const separator = argument.indexOf("=");
    if (!argument.startsWith("--") || separator === -1) {
      fail(`unsupported argument: ${argument}`);
    }

    options.set(argument.slice(2, separator), argument.slice(separator + 1));
  }

  return options;
}

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    fail("the release artifact must be a Git checkout with a resolvable HEAD");
  }
}

const options = readOptions(process.argv.slice(2));
const environment = options.get("environment");
const artifactSha = options.get("artifact-sha")?.toLowerCase();
const previewVerifiedSha = options.get("preview-verified-sha")?.toLowerCase();
const dryRun = options.has("dry-run");

if (!["preview", "production"].includes(environment)) {
  fail("--environment must be preview or production");
}

if (!artifactSha || !commitPattern.test(artifactSha)) {
  fail("--artifact-sha must be the full 40-character Git commit SHA");
}

const headSha = git(["rev-parse", "HEAD"]).toLowerCase();
if (headSha !== artifactSha) {
  fail("--artifact-sha does not match the checked-out release artifact");
}

if (git(["status", "--porcelain"])) {
  fail("the release artifact contains uncommitted or untracked files");
}

if (environment === "production" && previewVerifiedSha !== artifactSha) {
  fail("production requires --preview-verified-sha matching --artifact-sha");
}

if (!process.env.DATABASE_URL_UNPOOLED) {
  fail("missing required environment variable: DATABASE_URL_UNPOOLED");
}

if (!existsSync(prismaCliPath)) {
  fail("Prisma CLI is unavailable; install the locked dependencies with npm ci");
}

execFileSync(process.execPath, ["scripts/check-prisma-migrations.mjs"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

if (dryRun) {
  console.log(
    `Migration deploy preflight passed for ${environment} at ${artifactSha}; database was not changed.`,
  );
  process.exit(0);
}

console.log(`Applying verified migrations to ${environment} from artifact ${artifactSha}.`);
execFileSync(process.execPath, [prismaCliPath, "migrate", "deploy"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});
console.log(`Migration deploy completed for ${environment} at ${artifactSha}.`);
