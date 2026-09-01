import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const getAdminOrders = jest.fn<(input: unknown) => Promise<unknown>>();
class MockAuthenticationRequiredError extends Error {}
class MockAdminAccessRequiredError extends Error {}

jest.mock("@/modules/orders/server/admin", () => ({ getAdminOrders }));
jest.mock("@/server/admin-auth", () => ({
  AuthenticationRequiredError: MockAuthenticationRequiredError,
  AdminAccessRequiredError: MockAdminAccessRequiredError,
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

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const request = (url: string) => ({ url }) as Request;

  it("forwards only allowlisted pagination parameters", async () => {
    getAdminOrders.mockResolvedValue({ orders: [], nextCursor: null });
    const { GET } = await import("@/app/api/admin/orders/route");

    const response = await GET(
      request("https://example.test/api/admin/orders?cursor=VS-CURSOR&limit=10&role=ADMIN"),
    );

    expect(response.status).toBe(200);
    expect(getAdminOrders).toHaveBeenCalledWith({ cursor: "VS-CURSOR", limit: "10" });
  });

  it("maps missing authentication to 401", async () => {
    getAdminOrders.mockRejectedValue(new MockAuthenticationRequiredError());
    const { GET } = await import("@/app/api/admin/orders/route");

    const response = await GET(request("https://example.test/api/admin/orders"));

    expect(response.status).toBe(401);
  });

  it("maps insufficient role to 403", async () => {
    getAdminOrders.mockRejectedValue(new MockAdminAccessRequiredError());
    const { GET } = await import("@/app/api/admin/orders/route");

    const response = await GET(request("https://example.test/api/admin/orders"));

    expect(response.status).toBe(403);
  });
});
