import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));

const config = jest.fn();
const apiSignRequest = jest.fn(() => "signed-value");
const resource = jest.fn<() => Promise<unknown>>();
const destroy = jest.fn<() => Promise<unknown>>();

jest.mock("cloudinary", () => ({
  v2: {
    config,
    utils: { api_sign_request: apiSignRequest },
    api: { resource },
    uploader: { destroy },
  },
}));

const originalEnvironment = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  process.env.CLOUDINARY_API_KEY = "test-key";
  process.env.CLOUDINARY_API_SECRET = "test-secret";
});

afterEach(() => {
  const restore = (name: string, value: string | undefined) => {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  };
  restore("CLOUDINARY_CLOUD_NAME", originalEnvironment.cloudName);
  restore("CLOUDINARY_API_KEY", originalEnvironment.apiKey);
  restore("CLOUDINARY_API_SECRET", originalEnvironment.apiSecret);
});

describe("Cloudinary product image adapter", () => {
  it("signs only the fixed product-image policy", async () => {
    const { PRODUCT_IMAGE_FORMATS, PRODUCT_IMAGE_MAX_DIMENSION, signProductImageUpload } =
      await import("@/server/integrations/cloudinary");

    const result = signProductImageUpload(
      "virtual-space/products/product-42/image-1",
      1_700_000_000,
    );

    const expectedParameters = {
      allowed_formats: PRODUCT_IMAGE_FORMATS.join(","),
      public_id: "virtual-space/products/product-42/image-1",
      timestamp: 1_700_000_000,
      transformation: `c_limit,w_${PRODUCT_IMAGE_MAX_DIMENSION},h_${PRODUCT_IMAGE_MAX_DIMENSION}`,
    };
    expect(apiSignRequest).toHaveBeenCalledWith(expectedParameters, "test-secret");
    expect(result).toEqual({
      ...expectedParameters,
      apiKey: "test-key",
      cloudName: "test-cloud",
      signature: "signed-value",
    });
  });

  it.each([
    ["unsupported format", { format: "svg" }, "Unsupported Cloudinary image format"],
    ["oversized file", { bytes: 10 * 1024 * 1024 + 1 }, "Cloudinary image exceeds size limit"],
    ["oversized dimensions", { width: 4_097 }, "Cloudinary image exceeds dimension limit"],
  ])("rejects an %s returned by Cloudinary", async (_name, override, message) => {
    resource.mockResolvedValue({
      public_id: "virtual-space/products/product-42/image-1",
      resource_type: "image",
      format: "webp",
      bytes: 1_024,
      width: 1_200,
      height: 800,
      secure_url: "https://res.cloudinary.com/test/image/upload/image-1.webp",
      ...override,
    });
    const { getProductImageResource } = await import("@/server/integrations/cloudinary");

    await expect(getProductImageResource("image-1")).rejects.toThrow(message);
  });

  it("uses fixed image-only deletion options", async () => {
    destroy.mockResolvedValue({ result: "ok" });
    const { deleteProductImageResource } = await import("@/server/integrations/cloudinary");

    await expect(deleteProductImageResource("image-1")).resolves.toBeUndefined();
    expect(destroy).toHaveBeenCalledWith("image-1", {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });
  });
});
