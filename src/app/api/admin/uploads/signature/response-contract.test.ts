import { beforeAll, describe, expect, it, jest } from "@jest/globals";

const createImageUploadSignature = jest.fn<(productId: string) => Promise<unknown>>();

jest.mock("@/modules/catalog/server/admin", () => ({ createImageUploadSignature }));
jest.mock("@/server/admin-auth", () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  AdminAccessRequiredError: class AdminAccessRequiredError extends Error {},
}));

beforeAll(() => {
  globalThis.Response = class TestResponse {
    status: number;
    private readonly body: unknown;

    constructor(body: unknown, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    static json(body: unknown, init?: ResponseInit) {
      return new TestResponse(body, init);
    }

    async json() {
      return this.body;
    }
  } as unknown as typeof Response;
});

describe("upload signature response contract", () => {
  it("does not expose the duplicate Cloudinary public_id field", async () => {
    createImageUploadSignature.mockResolvedValue({
      publicId: "virtual-space/products/42/image",
      public_id: "virtual-space/products/42/image",
      signature: "signed",
    });
    const { POST } = await import("@/app/api/admin/uploads/signature/route");
    const response = await POST({ json: async () => ({ productId: "42" }) } as Request);

    await expect(response.json()).resolves.toEqual({
      publicId: "virtual-space/products/42/image",
      signature: "signed",
    });
  });
});
