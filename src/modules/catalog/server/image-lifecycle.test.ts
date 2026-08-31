import { beforeAll, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/server/db", () => ({ db: {} }));
jest.mock("@/server/integrations/cloudinary", () => ({
  PRODUCT_IMAGE_FOLDER: "virtual-space/products",
  signProductImageUpload: jest.fn(),
  getProductImageResource: jest.fn(),
  deleteProductImageResource: jest.fn(),
}));

let lifecycle: typeof import("@/modules/catalog/server/image-lifecycle");

beforeAll(async () => {
  lifecycle = await import("@/modules/catalog/server/image-lifecycle");
});

const resource = {
  publicId: "virtual-space/products/42/123e4567-e89b-12d3-a456-426614174000",
  secureUrl: "https://res.cloudinary.com/example/image/upload/file.webp",
  format: "webp" as const,
  bytes: 1_024,
  width: 800,
  height: 600,
};

describe("catalog image lifecycle", () => {
  it("creates a product-scoped signature only for an existing product", async () => {
    const sign = jest.fn((publicId: string, timestamp: number) => ({
      signature: "signed",
      apiKey: "key",
      cloudName: "cloud",
      allowed_formats: "jpg,jpeg,png,webp,avif",
      public_id: publicId,
      timestamp,
      transformation: "c_limit,w_4096,h_4096",
    }));
    const database = { product: { findUnique: jest.fn(async () => ({ id: BigInt(42) })) } };

    const result = await lifecycle.createImageUploadSignature(
      "42",
      database as never,
      { sign, get: jest.fn(), delete: jest.fn() } as never,
    );

    expect(result.publicId).toMatch(/^virtual-space\/products\/42\/[0-9a-f-]{36}$/);
    expect(sign).toHaveBeenCalledWith(result.publicId, expect.any(Number));
  });

  it("persists only metadata verified by Cloudinary", async () => {
    const create = jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id: BigInt(7),
      productId: BigInt(42),
      ...data,
    }));
    const transaction = {
      product: { findUnique: jest.fn(async () => ({ id: BigInt(42) })) },
      productImage: { create },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
      productImage: { findUnique: jest.fn(async () => null) },
    };
    const get = jest.fn(async () => resource);

    await lifecycle
      .finalizeImageUpload(
        {
          productId: "42",
          publicId: resource.publicId,
          secureUrl: "https://attacker.test/x",
          alt: "Sofa",
          position: 0,
        } as never,
        database as never,
        { sign: jest.fn(), get, delete: jest.fn() } as never,
      )
      .catch((error) => expect(error).toBeDefined());

    await expect(
      lifecycle.finalizeImageUpload(
        { productId: "42", publicId: resource.publicId, alt: "Sofa", position: 0 },
        database as never,
        { sign: jest.fn(), get, delete: jest.fn() } as never,
      ),
    ).resolves.toMatchObject({ secureUrl: resource.secureUrl });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ secureUrl: resource.secureUrl }),
      }),
    );
  });

  it("keeps the new database image active when old-resource cleanup fails", async () => {
    const transaction = {
      productImage: {
        findUnique: jest.fn(async () => ({
          id: BigInt(7),
          productId: BigInt(42),
          cloudinaryPublicId: "virtual-space/products/42/old",
          secureUrl: "https://example.test/old.webp",
          alt: "Old",
          position: 0,
        })),
        update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          id: BigInt(7),
          productId: BigInt(42),
          position: 0,
          ...data,
        })),
      },
    };
    const database = {
      $transaction: async <Result>(operation: (client: typeof transaction) => Promise<Result>) =>
        operation(transaction),
    };

    await expect(
      lifecycle.replaceImage(
        "7",
        { publicId: resource.publicId, alt: "New" },
        database as never,
        {
          sign: jest.fn(),
          get: jest.fn(async () => resource),
          delete: jest.fn(async () => {
            throw new Error("offline");
          }),
        } as never,
      ),
    ).resolves.toMatchObject({ cloudinaryPublicId: resource.publicId, cleanupPending: true });
  });

  it("reports incomplete Cloudinary cleanup after a product cascade", async () => {
    const remove = jest.fn(async (publicId: string) => {
      if (publicId.endsWith("/broken")) throw new Error("offline");
    });

    await expect(
      lifecycle.deleteProductImageResources(
        ["virtual-space/products/42/ok", "virtual-space/products/42/broken"],
        { delete: remove } as never,
      ),
    ).resolves.toEqual({
      cleanupPending: true,
      failedPublicIds: ["virtual-space/products/42/broken"],
    });
  });

  it("does not delete a resource already persisted by a concurrent finalization", async () => {
    const remove = jest.fn(async () => undefined);
    const database = {
      $transaction: async () => {
        throw new Error("unique conflict");
      },
      productImage: { findUnique: jest.fn(async () => ({ id: BigInt(9) })) },
    };

    await expect(
      lifecycle.finalizeImageUpload(
        { productId: "42", publicId: resource.publicId, alt: "Sofa", position: 0 },
        database as never,
        { sign: jest.fn(), get: jest.fn(async () => resource), delete: remove } as never,
      ),
    ).rejects.toThrow("unique conflict");
    expect(remove).not.toHaveBeenCalled();
  });
});
