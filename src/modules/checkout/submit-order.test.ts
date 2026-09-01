import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CheckoutSubmissionError, submitCheckoutOrder } from "@/modules/checkout/submit-order";

const submission = {
  contact: {
    name: "Анна",
    phone: "+375 29 000-00-00",
    email: "anna@example.com",
    comment: "",
  },
  items: [{ productId: "42", quantity: 1, selectedOptions: [], observedPrice: 1200 }],
};

describe("checkout order transport", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchMock });
  });
  afterEach(() => {
    fetchMock.mockReset();
    Reflect.deleteProperty(globalThis, "fetch");
  });

  function response(status: number, payload: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => payload,
    } as Response;
  }

  it("sends the validated cart to the real order contract", async () => {
    fetchMock.mockResolvedValue(
      response(201, {
        orderNumber: "VS-ORDER42",
        total: { amount: "1200.00", currency: "BYN" },
        status: "NEW",
      }),
    );

    await expect(submitCheckoutOrder(submission)).resolves.toEqual(
      expect.objectContaining({ orderNumber: "VS-ORDER42", status: "NEW" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("keeps a typed price conflict for explicit customer confirmation", async () => {
    fetchMock.mockResolvedValue(
      response(409, {
        status: "CONFLICT",
        issues: [
          {
            productId: "42",
            code: "PRICE_CHANGED",
            currentPrice: { amount: "1250.00", currency: "BYN" },
          },
        ],
      }),
    );

    try {
      await submitCheckoutOrder(submission);
      throw new Error("Expected checkout conflict");
    } catch (error) {
      expect(error).toBeInstanceOf(CheckoutSubmissionError);
      if (!(error instanceof CheckoutSubmissionError)) throw error;
      expect(error.issues[0]).toMatchObject({ productId: "42", code: "PRICE_CHANGED" });
    }
  });
});
