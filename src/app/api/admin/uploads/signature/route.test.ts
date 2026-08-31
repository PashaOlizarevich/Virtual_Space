import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const createImageUploadSignature = jest.fn<(productId: string) => Promise<unknown>>();
class MockAuthenticationRequiredError extends Error {}

jest.mock("@/modules/catalog/server/admin", () => ({ createImageUploadSignature }));
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

describe("POST /api/admin/uploads/signature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unknown input before requesting a signature", async () => {
    const { POST } = await import("@/app/api/admin/uploads/signature/route");
    const response = await POST(request({ productId: "42", folder: "attacker" }));

    expect(response.status).toBe(400);
    expect(createImageUploadSignature).not.toHaveBeenCalled();
  });

  it("returns the protected server-generated upload contract", async () => {
    createImageUploadSignature.mockResolvedValue({ publicId: "generated", signature: "signed" });
    const { POST } = await import("@/app/api/admin/uploads/signature/route");
    const response = await POST(request({ productId: "42" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ publicId: "generated" });
    expect(createImageUploadSignature).toHaveBeenCalledWith("42");
  });

  it("does not disclose a signature without an authenticated administrator", async () => {
    createImageUploadSignature.mockRejectedValue(new MockAuthenticationRequiredError());
    const { POST } = await import("@/app/api/admin/uploads/signature/route");

    const response = await POST(request({ productId: "42" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });
});
