import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { catalogSeed, categoryNames } from "../prisma/seed-data";

const allowedEnvironments = new Set(["preview", "production"]);
const environmentArgument = process.argv.find((argument) => argument.startsWith("--environment="));
const targetEnvironment = environmentArgument?.split("=", 2)[1];

if (!targetEnvironment || !allowedEnvironments.has(targetEnvironment)) {
  throw new Error("Catalog bootstrap requires --environment=preview or --environment=production");
}

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL_UNPOOLED");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function bootstrapCatalog(client: Prisma.TransactionClient): Promise<number> {
  const categories = new Map<string, bigint>();

  for (const [slug, name] of Object.entries(categoryNames)) {
    const category = await client.category.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
      select: { id: true },
    });
    categories.set(slug, category.id);
  }

  let createdProducts = 0;

  for (const productSeed of catalogSeed) {
    const existingProduct = await client.product.findUnique({
      where: { slug: productSeed.slug },
      select: { id: true },
    });

    if (existingProduct) continue;

    const categoryId = categories.get(productSeed.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing catalog category: ${productSeed.categorySlug}`);
    }

    const {
      images,
      specifications,
      optionGroups,
      categorySlug: _categorySlug,
      ...data
    } = productSeed;
    void _categorySlug;

    await client.product.create({
      data: {
        ...data,
        categoryId,
        images: { create: images },
        specifications: { create: specifications },
        optionGroups: {
          create: optionGroups.map(({ options, ...group }) => ({
            ...group,
            options: { create: options },
          })),
        },
      },
      select: { id: true },
    });
    createdProducts += 1;
  }

  return createdProducts;
}

async function main(): Promise<void> {
  const createdProducts = await prisma.$transaction(bootstrapCatalog, { timeout: 120_000 });
  console.log(
    `Catalog bootstrap completed for ${targetEnvironment}: ${createdProducts} products created.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("Catalog bootstrap failed.");
    await prisma.$disconnect();
    process.exitCode = 1;
    throw error;
  });
