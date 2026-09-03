import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, type OrderStatus, type UserRole } from "@prisma/client";
import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { z } from "zod";

const MAX_RETRY_INDEX = 2;
const FIXTURE_DATE = new Date("2026-01-01T00:00:00.000Z");
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_COST = 16_384;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELIZATION = 1;
const PASSWORD_MAX_MEMORY = 32 * 1024 * 1024;

const environmentSchema = z.strictObject({
  NODE_ENV: z.literal("test"),
  E2E_ALLOW_DATABASE_SEED: z.literal("true"),
  DATABASE_URL_UNPOOLED: z.string().url(),
  E2E_ADMIN_EMAIL: z.string().trim().email().max(254),
  E2E_ADMIN_PASSWORD: z.string().min(12).max(128),
  E2E_USER_EMAIL: z.string().trim().email().max(254),
  E2E_USER_PASSWORD: z.string().min(12).max(128),
});

const parsedEnvironment = environmentSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  E2E_ALLOW_DATABASE_SEED: process.env.E2E_ALLOW_DATABASE_SEED,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
  E2E_ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL,
  E2E_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD,
  E2E_USER_EMAIL: process.env.E2E_USER_EMAIL,
  E2E_USER_PASSWORD: process.env.E2E_USER_PASSWORD,
});

if (!parsedEnvironment.success) {
  const fields = [...new Set(parsedEnvironment.error.issues.map((issue) => issue.path.join(".")))];
  throw new Error(`Invalid E2E seed configuration: ${fields.join(", ")}.`);
}

const environment = parsedEnvironment.data;
const databaseUrl = new URL(environment.DATABASE_URL_UNPOOLED);
const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

if (!loopbackHosts.has(databaseUrl.hostname)) {
  throw new Error("E2E seed is restricted to a loopback PostgreSQL database.");
}

function retryEmail(email: string, retry: number): string {
  const separator = email.lastIndexOf("@");
  return `${email.slice(0, separator)}+retry-${retry}${email.slice(separator)}`.toLowerCase();
}

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      {
        N: PASSWORD_COST,
        r: PASSWORD_BLOCK_SIZE,
        p: PASSWORD_PARALLELIZATION,
        maxmem: PASSWORD_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(
          [
            "scrypt-v1",
            PASSWORD_COST,
            PASSWORD_BLOCK_SIZE,
            PASSWORD_PARALLELIZATION,
            salt.toString("base64url"),
            derivedKey.toString("base64url"),
          ].join("$"),
        );
      },
    );
  });
}

function createOptionsKey(
  selectedOptions: readonly Readonly<{ groupId: string; optionId: string }>[],
): string {
  return selectedOptions
    .map(({ groupId, optionId }) => `${groupId.length}:${groupId}${optionId.length}:${optionId}`)
    .toSorted()
    .join("|");
}

const selectedOptions = [
  { groupId: "upholstery", optionId: "boucle" },
  { groupId: "color", optionId: "milk" },
] satisfies Prisma.InputJsonArray;

const snapshotOptions: Prisma.InputJsonArray = [
  {
    groupId: "upholstery",
    groupLabel: "Обивка",
    optionId: "boucle",
    optionLabel: "Букле",
  },
  { groupId: "color", groupLabel: "Цвет", optionId: "milk", optionLabel: "Молочный" },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: environment.DATABASE_URL_UNPOOLED }),
});

type FixtureUser = Readonly<{
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}>;

async function upsertFixtureUser(
  client: Prisma.TransactionClient,
  fixture: FixtureUser,
): Promise<string> {
  const user = await client.user.upsert({
    where: { email: fixture.email },
    create: {
      ...fixture,
      emailVerified: FIXTURE_DATE,
    },
    update: {
      name: fixture.name,
      passwordHash: fixture.passwordHash,
      role: fixture.role,
      deletedAt: null,
      emailVerified: FIXTURE_DATE,
      credentialsVersion: 0,
    },
    select: { id: true },
  });
  return user.id;
}

type OrderFixture = Readonly<{
  publicNumber: string;
  customerName: string;
  email: string;
  status: OrderStatus;
  createdAt: Date;
  snapshotName: string;
  userId?: string;
}>;

async function upsertFixtureOrder(
  client: Prisma.TransactionClient,
  product: Readonly<{ id: bigint; price: Prisma.Decimal }>,
  fixture: OrderFixture,
): Promise<void> {
  const orderData = {
    userId: fixture.userId ?? null,
    customerName: fixture.customerName,
    phone: "+375 29 000-00-00",
    email: fixture.email,
    comment: "Изолированная E2E-фикстура",
    currency: "BYN" as const,
    total: product.price,
    status: fixture.status,
    retentionUntil: null,
    createdAt: fixture.createdAt,
    updatedAt: fixture.createdAt,
  };

  await client.order.upsert({
    where: { publicNumber: fixture.publicNumber },
    create: {
      publicNumber: fixture.publicNumber,
      ...orderData,
      items: {
        create: {
          productId: product.id,
          snapshotName: fixture.snapshotName,
          snapshotOptions,
          snapshotPrice: product.price,
          quantity: 1,
          lineTotal: product.price,
        },
      },
    },
    update: orderData,
  });
}

async function seedE2eFixtures(
  client: Prisma.TransactionClient,
  passwordHashes: Readonly<{ admin: string; user: string }>,
): Promise<void> {
  const category = await client.category.findUnique({
    where: { slug: "armchairs" },
    select: { id: true },
  });
  const forma = await client.product.findUnique({
    where: { slug: "forma-armchair" },
    select: { id: true, price: true },
  });

  if (!category || !forma) {
    throw new Error("Run the catalog seed before the E2E fixture seed.");
  }

  for (let retry = 0; retry <= MAX_RETRY_INDEX; retry += 1) {
    await upsertFixtureUser(client, {
      email: retryEmail(environment.E2E_ADMIN_EMAIL, retry),
      name: `E2E Admin ${retry}`,
      passwordHash: passwordHashes.admin,
      role: "ADMIN",
    });
    const userId = await upsertFixtureUser(client, {
      email: retryEmail(environment.E2E_USER_EMAIL, retry),
      name: "Анна",
      passwordHash: passwordHashes.user,
      role: "USER",
    });
    const fixtureProduct = await client.product.upsert({
      where: { slug: `e2e-admin-product-${retry}` },
      create: {
        categoryId: category.id,
        slug: `e2e-admin-product-${retry}`,
        name: `Пуф E2E ${retry}`,
        description: "Изолированный товар для проверки административного каталога.",
        price: new Prisma.Decimal("490.00"),
        stock: 8,
        isActive: false,
        material: "Букле",
        style: "Современный",
        dimensions: "50 × 50 × 42 см",
      },
      update: {
        categoryId: category.id,
        name: `Пуф E2E ${retry}`,
        description: "Изолированный товар для проверки административного каталога.",
        price: new Prisma.Decimal("490.00"),
        stock: 8,
        isActive: false,
        material: "Букле",
        style: "Современный",
        dimensions: "50 × 50 × 42 см",
      },
      select: { id: true },
    });
    await client.productImage.upsert({
      where: { cloudinaryPublicId: `virtual-space/e2e/admin-product-${retry}` },
      create: {
        productId: fixtureProduct.id,
        cloudinaryPublicId: `virtual-space/e2e/admin-product-${retry}`,
        secureUrl: "/images/armchairs/forma-armchair/01-main.png",
        alt: `Пуф E2E ${retry}`,
        position: 0,
      },
      update: {
        secureUrl: "/images/armchairs/forma-armchair/01-main.png",
        alt: `Пуф E2E ${retry}`,
        position: 0,
      },
    });

    const cart = await client.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { id: true },
    });
    await client.cartItem.deleteMany({ where: { cartId: cart.id } });
    await client.cartItem.create({
      data: {
        cartId: cart.id,
        productId: forma.id,
        selectedOptions,
        optionsKey: createOptionsKey(selectedOptions),
        quantity: 2,
        observedPrice: forma.price,
      },
    });

    await upsertFixtureOrder(client, forma, {
      publicNumber: `VS-E2ETRANS00${retry}`,
      customerName: `Переход статуса ${retry}`,
      email: retryEmail(environment.E2E_USER_EMAIL, retry),
      status: "NEW",
      createdAt: new Date(`2026-02-0${retry + 1}T12:00:00.000Z`),
      snapshotName: "Кресло Forma",
    });
    await upsertFixtureOrder(client, forma, {
      publicNumber: `VS-E2EPROFILE${retry}`,
      customerName: "Анна",
      email: retryEmail(environment.E2E_USER_EMAIL, retry),
      status: "IN_PROGRESS",
      createdAt: new Date(`2026-01-1${retry}T12:00:00.000Z`),
      snapshotName: "Кресло Forma",
      userId,
    });
  }

  const listFixtures: readonly OrderFixture[] = [
    {
      publicNumber: "VS-E2E00000042",
      customerName: "Анна Ковалёва",
      email: "anna.orders@example.test",
      status: "NEW",
      createdAt: new Date("2026-01-20T12:00:00.000Z"),
      snapshotName: "Диван Forma",
    },
    {
      publicNumber: "VS-E2E00000031",
      customerName: "Олег Петров",
      email: "oleg.orders@example.test",
      status: "CONFIRMED",
      createdAt: new Date("2026-01-19T12:00:00.000Z"),
      snapshotName: "Кресло Mono",
    },
    {
      publicNumber: "VS-E2E00000998",
      customerName: "Мария Сергеева",
      email: "maria.orders@example.test",
      status: "IN_PROGRESS",
      createdAt: new Date("2026-01-18T12:00:00.000Z"),
      snapshotName: "Пуф Solo",
    },
  ];

  for (const fixture of listFixtures) {
    await upsertFixtureOrder(client, forma, fixture);
  }
}

async function main(): Promise<void> {
  const [admin, user] = await Promise.all([
    hashPassword(environment.E2E_ADMIN_PASSWORD),
    hashPassword(environment.E2E_USER_PASSWORD),
  ]);
  await prisma.$transaction((transaction) => seedE2eFixtures(transaction, { admin, user }), {
    timeout: 120_000,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("E2E fixture seed failed; no credentials were logged.");
    await prisma.$disconnect();
    process.exitCode = 1;
    throw error;
  });
