import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const schemaPath = "prisma/schema.prisma";
const migrationsPath = "prisma/migrations";
const migrationFilePattern = /^prisma\/migrations\/\d{14}_[a-z0-9][a-z0-9_-]*\/migration\.sql$/;
const protectedMigrationPattern =
  /^prisma\/migrations\/(?:\d{14}_[^/]+\/migration\.sql|migration_lock\.toml)$/;

function fail(messages) {
  for (const message of messages) {
    console.error(`Migration check failed: ${message}`);
  }

  process.exitCode = 1;
}

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function normalize(filePath) {
  return filePath.replaceAll("\\", "/");
}

function parseNameStatus(output) {
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split("\t");
      return { status, paths: paths.map(normalize) };
    });
}

function resolveBaseRef() {
  const explicitBase = process.env.MIGRATION_BASE_REF?.trim();

  if (explicitBase) {
    return git(["merge-base", "HEAD", explicitBase]);
  }

  const currentBranch = git(["branch", "--show-current"]);

  if (currentBranch && !["main", "master", "dev"].includes(currentBranch)) {
    for (const candidate of [
      "origin/main",
      "main",
      "origin/master",
      "master",
      "origin/dev",
      "dev",
    ]) {
      const base = git(["merge-base", "HEAD", candidate]);
      if (base) {
        return base;
      }
    }
  }

  return null;
}

function collectChanges(baseRef) {
  const committed = baseRef
    ? parseNameStatus(git(["diff", "--name-status", `${baseRef}...HEAD`]))
    : [];
  const unstaged = parseNameStatus(git(["diff", "--name-status", "HEAD"]));
  const untracked = (git(["ls-files", "--others", "--exclude-standard"]) ?? "")
    .split("\n")
    .filter(Boolean)
    .map((filePath) => ({ status: "A", paths: [normalize(filePath)] }));

  return [...committed, ...unstaged, ...untracked];
}

function validateMigrationTree() {
  const errors = [];
  const migrationsRoot = path.join(projectRoot, migrationsPath);

  if (!existsSync(migrationsRoot)) {
    return [`missing ${migrationsPath}`];
  }

  const migrationLockPath = path.join(migrationsRoot, "migration_lock.toml");
  if (!existsSync(migrationLockPath)) {
    errors.push(`missing ${normalize(path.relative(projectRoot, migrationLockPath))}`);
  }

  for (const entry of readdirSync(migrationsRoot)) {
    if (entry === "migration_lock.toml" || entry === ".gitkeep") {
      continue;
    }

    const entryPath = path.join(migrationsRoot, entry);
    const relativeMigrationPath = normalize(path.join(migrationsPath, entry, "migration.sql"));

    if (!statSync(entryPath).isDirectory() || !/^\d{14}_[a-z0-9][a-z0-9_-]*$/.test(entry)) {
      errors.push(
        `unexpected migration entry: ${normalize(path.relative(projectRoot, entryPath))}`,
      );
      continue;
    }

    const sqlPath = path.join(entryPath, "migration.sql");
    if (!existsSync(sqlPath) || readFileSync(sqlPath, "utf8").trim().length === 0) {
      errors.push(`missing or empty ${relativeMigrationPath}`);
    }
  }

  return errors;
}

function validateChanges(changes, hasBaseRef) {
  const errors = [];
  const schemaChanged = changes.some(({ paths }) => paths.includes(schemaPath));
  const addedMigrations = new Set();

  for (const change of changes) {
    for (const changedPath of change.paths) {
      if (change.status.startsWith("A") && migrationFilePattern.test(changedPath)) {
        addedMigrations.add(changedPath);
      }

      if (protectedMigrationPattern.test(changedPath) && !change.status.startsWith("A")) {
        errors.push(`committed migration history is immutable: ${changedPath} (${change.status})`);
      }
    }
  }

  if (schemaChanged && addedMigrations.size === 0) {
    errors.push(`${schemaPath} changed without a new timestamped migration.sql`);
  }

  if (!hasBaseRef) {
    console.warn(
      "Migration check: no comparison base was found; history and working tree were validated only. " +
        "Set MIGRATION_BASE_REF in CI or review.",
    );
  }

  return errors;
}

const explicitBaseRequested = Boolean(process.env.MIGRATION_BASE_REF?.trim());
const baseRef = resolveBaseRef();
const changes = collectChanges(baseRef);
const errors = [...validateMigrationTree(), ...validateChanges(changes, Boolean(baseRef))];

if (explicitBaseRequested && !baseRef) {
  errors.push("MIGRATION_BASE_REF does not resolve to a common Git ancestor");
}

if (errors.length > 0) {
  fail(errors);
} else {
  console.log(
    `Migration check passed${baseRef ? ` against ${baseRef.slice(0, 12)}` : ""}: schema and migration history are consistent.`,
  );
}
