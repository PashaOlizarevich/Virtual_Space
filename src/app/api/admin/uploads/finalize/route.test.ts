import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const finalizeImageUpload = jest.fn<(input: unknown) => Promise<unknown>>();
class MockAuthenticationRequiredError extends Error {}

jest.mock("@/modules/catalog/server/admin", () => ({ finalizeImageUpload }));
jest.mock("@/server/admin-auth", () => ({
  AuthenticationRequiredError: MockAuthenticationRequiredError,
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

const request = (body: unknown) => ({ json: async () => body }) as unknown as Request;
const validInput = {
  productId: "42",
  publicId: "virtual-space/products/42/123e4567-e89b-12d3-a456-426614174000",
  alt: "Product image",
  position: 0,
};

describe("POST /api/admin/uploads/finalize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unknown input before finalizing the image", async () => {
    const { POST } = await import("@/app/api/admin/uploads/finalize/route");
    const response = await POST(request({ ...validInput, secureUrl: "https://attacker.invalid" }));

    expect(response.status).toBe(400);
    expect(finalizeImageUpload).not.toHaveBeenCalled();
  });

  it("finalizes a server-verified Cloudinary resource", async () => {
    finalizeImageUpload.mockResolvedValue({ id: "7", productId: "42" });
    const { POST } = await import("@/app/api/admin/uploads/finalize/route");
    const response = await POST(request(validInput));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: "7", productId: "42" });
    expect(finalizeImageUpload).toHaveBeenCalledWith(validInput);
  });

  it("does not finalize without an authenticated administrator", async () => {
    finalizeImageUpload.mockRejectedValue(new MockAuthenticationRequiredError());
    const { POST } = await import("@/app/api/admin/uploads/finalize/route");
    const response = await POST(request(validInput));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });
});
