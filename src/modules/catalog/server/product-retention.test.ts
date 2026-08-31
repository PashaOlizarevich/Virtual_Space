import { beforeAll, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/modules/catalog/server/image-lifecycle", () => ({
  deleteProductImageResources: jest.fn(async () => ({
    cleanupPending: false,
    failedPublicIds: [],
  })),
}));

let service: typeof import("@/modules/catalog/server/admin-service");
let imageLifecycle: typeof import("@/modules/catalog/server/image-lifecycle");

beforeAll(async () => {
  [service, imageLifecycle] = await Promise.all([
    import("@/modules/catalog/server/admin-service"),
    import("@/modules/catalog/server/image-lifecycle"),
  ]);
});

const productRecord = {
  id: BigInt(7),
  categoryId: BigInt(42),
  slug: "cloud-sofa",
  name: "Cloud sofa",
  description: "A sufficiently detailed product description",
  price: { toFixed: () => "1999.90" },
  currency: "BYN",
  stock: 4,
  isActive: false,
  newFrom: null,
  newUntil: null,
  material: "Textile",
  style: "Modern",
  dimensions: "220 × 95 cm",
};

describe("ordered product retention", () => {
  it("deactivates a product referenced by an order item instead of deleting it", async () => {
    const transaction = {
      orderItem: { count: jest.fn(async () => 1) },
      product: {
        update: jest.fn(async () => productRecord),
        delete: jest.fn(),
      },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(service.deleteProduct("7", database as never)).resolves.toMatchObject({
      id: "7",
      isActive: false,
      action: "deactivated",
    });
    expect(transaction.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: BigInt(7) }, data: { isActive: false } }),
    );
    expect(transaction.product.delete).not.toHaveBeenCalled();
  });

  it("physically deletes an unreferenced product and schedules its images for cleanup", async () => {
    const transaction = {
      orderItem: { count: jest.fn(async () => 0) },
      product: {
        update: jest.fn(),
        delete: jest.fn(async () => ({
          ...productRecord,
          images: [{ cloudinaryPublicId: "virtual-space/products/7/image-id" }],
        })),
      },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(service.deleteProduct("7", database as never)).resolves.toMatchObject({
      id: "7",
      action: "deleted",
    });
    expect(transaction.product.update).not.toHaveBeenCalled();
    expect(imageLifecycle.deleteProductImageResources).toHaveBeenCalledWith([
      "virtual-space/products/7/image-id",
    ]);
  });
});
