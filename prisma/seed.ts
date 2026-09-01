import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { catalogSeed, categoryNames, storeSettingsSeed } from "./seed-data";

if (process.env.NODE_ENV === "production") {
  throw new Error("Database seed is disabled in production.");
}

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL_UNPOOLED");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seedCatalog(client: Prisma.TransactionClient): Promise<void> {
  const categories = new Map<string, bigint>();

  for (const [slug, name] of Object.entries(categoryNames)) {
    const category = await client.category.upsert({
      where: { slug },
      create: { slug, name },
      update: { name },
      select: { id: true },
    });
    categories.set(slug, category.id);
  }

  for (const productSeed of catalogSeed) {
    const categoryId = categories.get(productSeed.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing seeded category: ${productSeed.categorySlug}`);
    }

    const {
      images,
      specifications,
      optionGroups,
      categorySlug: _categorySlug,
      ...data
    } = productSeed;
    void _categorySlug;
    const product = await client.product.upsert({
      where: { slug: data.slug },
      create: { ...data, categoryId },
      update: { ...data, categoryId },
      select: { id: true },
    });

    for (const image of images) {
      await client.productImage.upsert({
        where: { cloudinaryPublicId: image.cloudinaryPublicId },
        create: { ...image, productId: product.id },
        update: { secureUrl: image.secureUrl, alt: image.alt, position: image.position },
      });
    }

    for (const specification of specifications) {
      await client.productSpecification.upsert({
        where: { productId_label: { productId: product.id, label: specification.label } },
        create: { ...specification, productId: product.id },
        update: { value: specification.value, position: specification.position },
      });
    }

    for (const groupSeed of optionGroups) {
      const { options, ...groupData } = groupSeed;
      const group = await client.productOptionGroup.upsert({
        where: { productId_key: { productId: product.id, key: groupData.key } },
        create: { ...groupData, productId: product.id },
        update: { label: groupData.label, position: groupData.position },
        select: { id: true },
      });

      for (const option of options) {
        await client.productOption.upsert({
          where: { groupId_key: { groupId: group.id, key: option.key } },
          create: { ...option, groupId: group.id },
          update: { label: option.label, position: option.position },
        });
      }
    }
  }
}

async function main(): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      await seedCatalog(transaction);
      await transaction.storeSettings.upsert({
        where: { key: storeSettingsSeed.key },
        create: storeSettingsSeed,
        update: storeSettingsSeed,
      });
    },
    { timeout: 120_000 },
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("Database seed failed.");
    await prisma.$disconnect();
    process.exitCode = 1;
    throw error;
  });
