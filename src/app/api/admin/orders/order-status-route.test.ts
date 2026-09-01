import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const updateAdminOrderStatus = jest.fn<(input: unknown) => Promise<unknown>>();
class MockAuthenticationRequiredError extends Error {}
class MockAdminAccessRequiredError extends Error {}
class MockOrderStatusUpdateNotFoundError extends Error {}
class MockConcurrentOrderStatusUpdateError extends Error {}
class MockInvalidOrderStatusTransitionError extends Error {}

jest.mock("@/modules/orders/server/admin-status", () => ({ updateAdminOrderStatus }));
jest.mock("@/server/admin-auth", () => ({
  AuthenticationRequiredError: MockAuthenticationRequiredError,
  AdminAccessRequiredError: MockAdminAccessRequiredError,
}));
jest.mock("@/modules/orders/server/order-status-update", () => ({
  OrderStatusUpdateNotFoundError: MockOrderStatusUpdateNotFoundError,
  ConcurrentOrderStatusUpdateError: MockConcurrentOrderStatusUpdateError,
}));
jest.mock("@/modules/orders/server/status-transitions", () => ({
  InvalidOrderStatusTransitionError: MockInvalidOrderStatusTransitionError,
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

describe("PATCH /api/admin/orders/[orderNumber]/status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const context = { params: Promise.resolve({ orderNumber: "VS-PATH42" }) };
  const request = (body: unknown) => ({ json: async () => body }) as Request;

  it("uses the path order number and forwards only the mutation input", async () => {
    updateAdminOrderStatus.mockResolvedValue({ orderNumber: "VS-PATH42", status: "CONFIRMED" });
    const { PATCH } = await import("@/app/api/admin/orders/[orderNumber]/status/route");

    const response = await PATCH(
      request({ orderNumber: "VS-SPOOFED", status: "CONFIRMED" }),
      context,
    );

    expect(response.status).toBe(200);
    expect(updateAdminOrderStatus).toHaveBeenCalledWith({
      orderNumber: "VS-PATH42",
      status: "CONFIRMED",
    });
  });

  it.each([
    [new MockAuthenticationRequiredError(), 401],
    [new MockAdminAccessRequiredError(), 403],
    [new MockOrderStatusUpdateNotFoundError(), 404],
    [new MockInvalidOrderStatusTransitionError(), 409],
    [new MockConcurrentOrderStatusUpdateError(), 409],
  ])("maps a controlled failure to HTTP %i", async (error, expectedStatus) => {
    updateAdminOrderStatus.mockRejectedValue(error);
    const { PATCH } = await import("@/app/api/admin/orders/[orderNumber]/status/route");

    const response = await PATCH(request({ status: "CONFIRMED" }), context);

    expect(response.status).toBe(expectedStatus);
  });
});
