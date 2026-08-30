import { z } from "zod";

export const MONEY_FRACTION_DIGITS = 2;
export const MONEY_CURRENCY = "BYN" as const;

const canonicalAmountPattern = /^(?:0|[1-9]\d{0,9})\.\d{2}$/;

export const moneyDtoSchema = z.strictObject({
  amount: z.string().regex(canonicalAmountPattern),
  currency: z.literal(MONEY_CURRENCY),
});

export type MoneyDto = z.infer<typeof moneyDtoSchema>;

type DecimalLike = Readonly<{
  toFixed(fractionDigits: number): string;
}>;

export type MoneySource = number | DecimalLike;
export type FormattableMoney = number | MoneyDto;

export function mapMoney(value: MoneySource, currency = MONEY_CURRENCY): MoneyDto {
  const amount = value.toFixed(MONEY_FRACTION_DIGITS);

  return moneyDtoSchema.parse({ amount, currency });
}

export function moneyToNumber(value: FormattableMoney): number {
  return typeof value === "number" ? value : Number(value.amount);
}

export function formatMoney(value: FormattableMoney, locale = "ru-BY"): string {
  const currency = typeof value === "number" ? MONEY_CURRENCY : value.currency;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: MONEY_FRACTION_DIGITS,
  }).format(moneyToNumber(value));
}
