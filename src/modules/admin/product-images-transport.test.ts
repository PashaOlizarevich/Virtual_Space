import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  finalizeProductImage,
  requestProductImageUploadSignature,
} from "@/modules/admin/product-images-transport";

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<typeof fetch>();

beforeAll(() => {
  globalThis.fetch = fetchMock;
});

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("admin product image transport", () => {
  it("returns a validated upload signature", async () => {
    const payload = {
      allowed_formats: "jpg,png,webp",
      apiKey: "key",
      cloudName: "cloud",
      publicId: "virtual-space/products/42/image",
      signature: "signature",
      timestamp: 1,
      transformation: "c_limit,w_4096,h_4096",
    };
    fetchMock.mockResolvedValue(response(200, payload));

    await expect(requestProductImageUploadSignature("42")).resolves.toEqual(payload);
  });

  it("surfaces a useful Cloudinary configuration error", async () => {
    fetchMock.mockResolvedValue(response(500, null));

    await expect(requestProductImageUploadSignature("42")).rejects.toThrow(
      "Проверьте настройки Cloudinary в Vercel",
    );
  });

  it("finalizes an uploaded image through the protected endpoint", async () => {
    const image = {
      id: "7",
      productId: "42",
      cloudinaryPublicId: "virtual-space/products/42/image",
      secureUrl: "https://res.cloudinary.com/cloud/image/upload/image.webp",
      alt: "Product image",
      position: 0,
    };
    fetchMock.mockResolvedValue(response(200, image));

    await expect(
      finalizeProductImage({
        productId: "42",
        publicId: "virtual-space/products/42/image",
        alt: "Product image",
        position: 0,
      }),
    ).resolves.toEqual(image);
  });
});
