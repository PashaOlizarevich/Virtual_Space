import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { z } from "zod";

import type { GuestCheckoutPreflightResult } from "@/modules/orders/server/checkout-preflight";

const preflightGuestCheckout = jest.fn<(input: unknown) => Promise<GuestCheckoutPreflightResult>>();

jest.mock("@/modules/orders/server/checkout-preflight", () => ({ preflightGuestCheckout }));

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

describe("POST /api/orders/preflight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 409 with current values when price confirmation is required", async () => {
    const conflict = {
      status: "CONFLICT",
      issues: [
        {
          productId: "1",
          code: "PRICE_CHANGED",
          currentPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    } satisfies GuestCheckoutPreflightResult;
    preflightGuestCheckout.mockResolvedValue(conflict);
    const { POST } = await import("@/app/api/orders/preflight/route");

    const response = await POST(request({ items: [] }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual(conflict);
  });

  it("returns the server-owned ready cart after confirmation", async () => {
    const ready = {
      status: "READY",
      items: [
        {
          productId: "1",
          name: "Кресло Forma",
          quantity: 1,
          selectedOptions: [],
          unitPrice: { amount: "1390.00", currency: "BYN" },
        },
      ],
    } satisfies GuestCheckoutPreflightResult;
    preflightGuestCheckout.mockResolvedValue(ready);
    const { POST } = await import("@/app/api/orders/preflight/route");

    const response = await POST(request({ items: [{ observedPrice: 1390 }] }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(ready);
  });

  it("maps untrusted invalid input to a safe 400 response", async () => {
    const invalidInput = z.strictObject({ items: z.array(z.never()) }).safeParse({});

    if (invalidInput.success) throw new Error("Expected invalid test input");
    preflightGuestCheckout.mockRejectedValue(invalidInput.error);
    const { POST } = await import("@/app/api/orders/preflight/route");

    const response = await POST(request({ role: "ADMIN" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid request" });
  });

  it("does not expose unexpected server errors", async () => {
    preflightGuestCheckout.mockRejectedValue(new Error("database connection details"));
    const { POST } = await import("@/app/api/orders/preflight/route");

    const response = await POST(request({ items: [] }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to validate cart" });
  });
});
