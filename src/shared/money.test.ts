import { describe, expect, it } from "@jest/globals";

import { formatMoney, mapMoney, moneyDtoSchema, moneyToNumber } from "@/shared/money";

describe("money contract", () => {
  it("maps Decimal-like values to a JSON-safe canonical DTO", () => {
    const decimal = { toFixed: (fractionDigits: number) => (1299.9).toFixed(fractionDigits) };

    expect(mapMoney(decimal)).toEqual({ amount: "1299.90", currency: "BYN" });
  });

  it("supports legacy number values during the frontend transition", () => {
    const dto = mapMoney(199.9);

    expect(dto).toEqual({ amount: "199.90", currency: "BYN" });
    expect(moneyToNumber(dto)).toBe(199.9);
    expect(formatMoney(dto)).toBe(formatMoney(199.9));
  });

  it.each(["01.00", "1", "1.0", "1.000", "1,00", "-1.00", "10000000000.00"])(
    "rejects non-canonical amount %s",
    (amount) => {
      expect(moneyDtoSchema.safeParse({ amount, currency: "BYN" }).success).toBe(false);
    },
  );

  it("rejects invalid or out-of-range mapper inputs", () => {
    expect(() => mapMoney(Number.NaN)).toThrow();
    expect(() => mapMoney(-1)).toThrow();
    expect(() => mapMoney(10_000_000_000)).toThrow();
  });
});
