import { randomUUID } from "node:crypto";

import pg from "pg";

const { Client } = pg;
const allowedEnvironments = new Set(["local", "test", "preview"]);
const verificationEnvironment = process.env.QUERY_PLAN_ENV?.trim().toLowerCase();

if (!allowedEnvironments.has(verificationEnvironment)) {
  console.error(
    "Query-plan verification requires QUERY_PLAN_ENV=local, test, or preview. Production is forbidden.",
  );
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Query-plan verification is disabled when NODE_ENV=production.");
  process.exit(1);
}

if (process.env.QUERY_PLAN_ALLOW_WRITES !== "1") {
  console.error(
    "Query-plan verification writes rollback-only fixtures; set QUERY_PLAN_ALLOW_WRITES=1 to confirm the non-production target.",
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error("Query-plan verification requires DATABASE_URL_UNPOOLED.");
  process.exit(1);
}

const fixtureTag = `query-plan-${randomUUID()}`;
const productCount = 2_000;
const orderCount = 2_000;

const checks = [
  {
    name: "catalog page",
    expectedIndexes: ["Product_isActive_createdAt_id_idx"],
    sql: `
      SELECT p."id", p."slug", p."createdAt"
      FROM "Product" p
      WHERE p."isActive" = true
      ORDER BY p."createdAt" DESC, p."id" DESC
      LIMIT 25
    `,
    parameters: [],
  },
  {
    name: "category catalog page",
    expectedIndexes: ["Category_slug_key", "Product_categoryId_isActive_createdAt_id_idx"],
    sql: `
      SELECT p."id", p."slug", p."createdAt"
      FROM "Product" p
      WHERE p."categoryId" = (SELECT c."id" FROM "Category" c WHERE c."slug" = $1)
        AND p."isActive" = true
      ORDER BY p."createdAt" DESC, p."id" DESC
      LIMIT 25
    `,
    parameters: [`${fixtureTag}-category`],
  },
  {
    name: "user cart",
    expectedIndexes: ["Cart_userId_key", "CartItem_cartId_createdAt_id_idx"],
    sql: `
      SELECT ci."id", ci."productId", ci."quantity", ci."createdAt"
      FROM "CartItem" ci
      WHERE ci."cartId" = (SELECT c."id" FROM "Cart" c WHERE c."userId" = $1)
      ORDER BY ci."createdAt" ASC, ci."id" ASC
    `,
    parameters: [`${fixtureTag}-user`],
  },
  {
    name: "own order history",
    expectedIndexes: ["Order_userId_createdAt_id_idx"],
    sql: `
      SELECT o."id", o."publicNumber", o."createdAt"
      FROM "Order" o
      WHERE o."userId" = $1
      ORDER BY o."createdAt" DESC, o."id" DESC
      LIMIT 26
    `,
    parameters: [`${fixtureTag}-user`],
  },
  {
    name: "admin order list",
    expectedIndexes: ["Order_createdAt_id_idx"],
    sql: `
      SELECT o."id", o."publicNumber", o."createdAt"
      FROM "Order" o
      ORDER BY o."createdAt" DESC, o."id" DESC
      LIMIT 26
    `,
    parameters: [],
  },
  {
    name: "order lookup",
    expectedIndexes: ["Order_publicNumber_key"],
    sql: `
      SELECT o."id", o."publicNumber", o."status"
      FROM "Order" o
      WHERE o."publicNumber" = $1
      LIMIT 1
    `,
    parameters: [`${fixtureTag}-order-1`],
  },
];

function collectIndexes(node, indexes = new Set()) {
  if (typeof node !== "object" || node === null) return indexes;
  if (typeof node["Index Name"] === "string") indexes.add(node["Index Name"]);
  for (const child of node.Plans ?? []) collectIndexes(child, indexes);
  return indexes;
}

async function insertFixtures(client) {
  const category = await client.query(
    `INSERT INTO "Category" ("slug", "name", "updatedAt") VALUES ($1, $2, NOW()) RETURNING "id"`,
    [`${fixtureTag}-category`, fixtureTag],
  );
  const categoryId = category.rows[0].id;

  await client.query(
    `
      INSERT INTO "Product" (
        "categoryId", "slug", "name", "description", "price", "stock", "isActive",
        "material", "style", "dimensions", "createdAt", "updatedAt"
      )
      SELECT $1, $2 || '-product-' || n, 'Plan product ' || n, 'fixture', 100.00, 100, true,
        'fixture', 'fixture', 'fixture', NOW() - (n || ' seconds')::interval, NOW()
      FROM generate_series(1, $3::integer) AS n
    `,
    [categoryId, fixtureTag, productCount],
  );

  const targetProducts = await client.query(
    `SELECT "id", "price" FROM "Product" WHERE "slug" LIKE $1 || '-product-%' ORDER BY "id" LIMIT 10`,
    [fixtureTag],
  );
  await client.query(`INSERT INTO "User" ("id", "email", "updatedAt") VALUES ($1, $2, NOW())`, [
    `${fixtureTag}-user`,
    `${fixtureTag}@example.invalid`,
  ]);
  const cart = await client.query(
    `INSERT INTO "Cart" ("userId", "updatedAt") VALUES ($1, NOW()) RETURNING "id"`,
    [`${fixtureTag}-user`],
  );

  for (const product of targetProducts.rows) {
    await client.query(
      `
        INSERT INTO "CartItem" (
          "cartId", "productId", "selectedOptions", "optionsKey", "quantity", "observedPrice", "updatedAt"
        ) VALUES ($1, $2, '[]'::jsonb, $3, 1, $4, NOW())
      `,
      [cart.rows[0].id, product.id, `target-${product.id}`, product.price],
    );
  }

  await client.query(
    `
      INSERT INTO "User" ("id", "email", "updatedAt")
      SELECT $1 || '-background-user-' || n, $1 || '-background-' || n || '@example.invalid', NOW()
      FROM generate_series(1, 100) AS n
    `,
    [fixtureTag],
  );
  await client.query(
    `
      INSERT INTO "Cart" ("userId", "updatedAt")
      SELECT "id", NOW() FROM "User" WHERE "id" LIKE $1 || '-background-user-%'
    `,
    [fixtureTag],
  );
  await client.query(
    `
      INSERT INTO "CartItem" (
        "cartId", "productId", "selectedOptions", "optionsKey", "quantity", "observedPrice", "updatedAt"
      )
      SELECT c."id", p."id", '[]'::jsonb, 'background-' || p."id", 1, p."price", NOW()
      FROM "Cart" c
      CROSS JOIN LATERAL (
        SELECT "id", "price" FROM "Product"
        WHERE "slug" LIKE $1 || '-product-%'
        ORDER BY "id" OFFSET ((c."id" % 50)::integer) LIMIT 25
      ) p
      WHERE c."userId" LIKE $1 || '-background-user-%'
    `,
    [fixtureTag],
  );

  await client.query(
    `
      INSERT INTO "Order" (
        "publicNumber", "userId", "customerName", "phone", "email", "total", "status",
        "createdAt", "updatedAt"
      )
      SELECT $1 || '-order-' || n, $2, 'Plan customer', '+375000000000',
        $1 || '@example.invalid', 100.00, 'NEW', NOW() - (n || ' seconds')::interval, NOW()
      FROM generate_series(1, $3::integer) AS n
    `,
    [fixtureTag, `${fixtureTag}-user`, orderCount],
  );

  await client.query('ANALYZE "Category", "Product", "Cart", "CartItem", "Order"');
}

async function verify() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '30s'");
    await insertFixtures(client);

    for (const check of checks) {
      const result = await client.query(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${check.sql}`,
        check.parameters,
      );
      const plan = result.rows[0]["QUERY PLAN"][0].Plan;
      const usedIndexes = collectIndexes(plan);
      const missingIndexes = check.expectedIndexes.filter((index) => !usedIndexes.has(index));

      if (missingIndexes.length > 0) {
        throw new Error(
          `${check.name}: expected index(es) not used: ${missingIndexes.join(", ")}; used: ${
            [...usedIndexes].join(", ") || "none"
          }`,
        );
      }

      console.log(`${check.name}: ${[...usedIndexes].join(", ")}`);
    }

    console.log(
      `Query-plan verification passed for ${productCount} products and ${orderCount} orders; fixtures were rolled back.`,
    );
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.end();
  }
}

verify().catch((error) => {
  console.error(
    `Query-plan verification failed: ${error instanceof Error ? error.message : "unknown error"}`,
  );
  process.exitCode = 1;
});
