import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";

import type { CreatedGuestOrderDto } from "@/modules/orders/server/order-creation";

const createGuestOrder = jest.fn<(input: unknown) => Promise<CreatedGuestOrderDto>>();

jest.mock("@/modules/orders/server/order-creation", () => {
  class OrderCreationConflictError extends Error {
    constructor(readonly issues: readonly unknown[]) {
      super("conflict");
    }
  }

  return { createGuestOrder, OrderCreationConflictError };
});

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

describe("POST /api/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns only the public order result after commit", async () => {
    createGuestOrder.mockResolvedValue({
      orderNumber: "VS-TESTORDER001",
      total: { amount: "2780.00", currency: "BYN" },
      status: "NEW",
    });
    const { POST } = await import("@/app/api/orders/route");

    const response = await POST(request({ contact: {}, cart: {} }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      orderNumber: "VS-TESTORDER001",
      total: { amount: "2780.00", currency: "BYN" },
      status: "NEW",
    });
  });

  it("maps a concurrent stock conflict to 409 without internal details", async () => {
    const { OrderCreationConflictError } = await import("@/modules/orders/server/order-creation");
    createGuestOrder.mockRejectedValue(
      new OrderCreationConflictError([{ productId: "1", code: "INSUFFICIENT_STOCK" }]),
    );
    const { POST } = await import("@/app/api/orders/route");

    const response = await POST(request({}));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      status: "CONFLICT",
      issues: [{ productId: "1", code: "INSUFFICIENT_STOCK" }],
    });
  });

  it("maps invalid input to a safe 400 response", async () => {
    const invalidInput = z.strictObject({ cart: z.never() }).safeParse({});

    if (invalidInput.success) throw new Error("Expected invalid test input");
    createGuestOrder.mockRejectedValue(invalidInput.error);
    const { POST } = await import("@/app/api/orders/route");

    const response = await POST(request({ role: "ADMIN" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid request" });
  });

  it("does not expose unexpected database errors", async () => {
    createGuestOrder.mockRejectedValue(new Error("database connection details"));
    const { POST } = await import("@/app/api/orders/route");

    const response = await POST(request({}));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to create order" });
  });
});
