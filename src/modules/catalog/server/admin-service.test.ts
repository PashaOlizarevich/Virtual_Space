import { beforeAll, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));

let service: typeof import("@/modules/catalog/server/admin-service");

beforeAll(async () => {
  service = await import("@/modules/catalog/server/admin-service");
});

const validProduct = {
  categoryId: "42",
  slug: "cloud-sofa",
  name: "Cloud sofa",
  description: "A sufficiently detailed product description",
  price: "1999.90",
  stock: 4,
  isActive: true,
  newFrom: null,
  newUntil: null,
  material: "Textile",
  style: "Modern",
  dimensions: "220 × 95 cm",
};

describe("catalog admin service", () => {
  it("checks a related category before creating an allowlisted product", async () => {
    const transaction = {
      category: {
        findUnique: jest.fn<(args: unknown) => Promise<{ id: bigint }>>(async () => ({
          id: BigInt(42),
        })),
      },
      product: {
        create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          id: BigInt(7),
          ...data,
          categoryId: BigInt(42),
          price: { toFixed: () => "1999.90" },
          currency: "BYN",
        })),
      },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(
      service.createProduct({ ...validProduct, id: "attacker" } as never, database as never),
    ).rejects.toThrow();
    await expect(service.createProduct(validProduct, database as never)).resolves.toMatchObject({
      id: "7",
      categoryId: "42",
      price: "1999.90",
    });
    expect(transaction.category.findUnique).toHaveBeenCalledWith({
      where: { id: BigInt(42) },
      select: { id: true },
    });
    expect(transaction.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ id: expect.anything() }),
      }),
    );
  });

  it("rejects a missing related category before writing", async () => {
    const transaction = {
      category: { findUnique: jest.fn(async () => null) },
      product: { create: jest.fn() },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(service.createProduct(validProduct, database as never)).rejects.toBeInstanceOf(
      service.CatalogRelationNotFoundError,
    );
    expect(transaction.product.create).not.toHaveBeenCalled();
  });

  it("does not delete a category that still owns products", async () => {
    const transaction = {
      product: { count: jest.fn(async () => 1) },
      category: { delete: jest.fn() },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(service.deleteCategory("42", database as never)).rejects.toBeInstanceOf(
      service.CatalogDeleteConflictError,
    );
    expect(transaction.category.delete).not.toHaveBeenCalled();
  });
});
