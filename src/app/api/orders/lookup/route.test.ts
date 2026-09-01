import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const auth = jest.fn<() => Promise<{ user?: { id?: string } } | null>>();
const getCustomerOrder = jest.fn<(input: unknown, userId: string | null) => Promise<unknown>>();
class MockOrderNotFoundError extends Error {}

jest.mock("@/server/auth", () => ({ auth }));
jest.mock("@/modules/orders/server/order-read", () => ({
  getCustomerOrder,
  OrderNotFoundError: MockOrderNotFoundError,
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

describe("POST /api/orders/lookup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue(null);
  });

  it("passes only the authenticated session identity to the read service", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    getCustomerOrder.mockResolvedValue({ orderNumber: "VS-TESTORDER001" });
    const { POST } = await import("@/app/api/orders/lookup/route");

    const response = await POST(request({ orderNumber: "VS-TESTORDER001" }));

    expect(response.status).toBe(200);
    expect(getCustomerOrder).toHaveBeenCalledWith({ orderNumber: "VS-TESTORDER001" }, "user-1");
  });

  it("uses the same 404 response for missing and unauthorized orders", async () => {
    getCustomerOrder.mockRejectedValue(new MockOrderNotFoundError());
    const { POST } = await import("@/app/api/orders/lookup/route");

    const response = await POST(
      request({ orderNumber: "VS-TESTORDER001", email: "attacker@example.com" }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Order not found" });
  });

  it("does not expose unexpected errors", async () => {
    getCustomerOrder.mockRejectedValue(new Error("database details"));
    const { POST } = await import("@/app/api/orders/lookup/route");

    const response = await POST(request({ orderNumber: "VS-TESTORDER001" }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to retrieve order" });
  });
});
