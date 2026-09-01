import { checkoutFormSchema, type CheckoutFormValues } from "@/modules/checkout/schemas";
import { persistedCartSchema } from "@/modules/cart/schemas";
import type { CartItem } from "@/modules/cart/types";
import { moneyDtoSchema, type MoneyDto } from "@/shared/money";
import { z } from "zod";

export type CheckoutSubmission = Readonly<{
  contact: CheckoutFormValues;
  items: readonly CartItem[];
}>;

export type CheckoutSubmissionResult = Readonly<{
  orderNumber: string;
  total: MoneyDto;
  status: "NEW";
}>;

const checkoutIssueSchema = z.strictObject({
  productId: z.string(),
  code: z.enum([
    "PRODUCT_UNAVAILABLE",
    "INSUFFICIENT_STOCK",
    "INVALID_CONFIGURATION",
    "PRICE_CHANGED",
  ]),
  currentPrice: moneyDtoSchema.optional(),
});

export type CheckoutSubmissionIssue = z.infer<typeof checkoutIssueSchema>;

const checkoutSubmissionResultSchema = z.strictObject({
  orderNumber: z.string().min(1),
  total: moneyDtoSchema,
  status: z.literal("NEW"),
});

const checkoutConflictSchema = z.strictObject({
  status: z.literal("CONFLICT"),
  issues: z.array(checkoutIssueSchema),
});

export class CheckoutSubmissionError extends Error {
  constructor(
    message: string,
    readonly issues: readonly CheckoutSubmissionIssue[] = [],
  ) {
    super(message);
    this.name = "CheckoutSubmissionError";
  }
}

/**
 * Public checkout transport. The server owns price, stock and configuration validation.
 */
export async function submitCheckoutOrder(
  submission: CheckoutSubmission,
): Promise<CheckoutSubmissionResult> {
  const contact = checkoutFormSchema.safeParse(submission.contact);
  const cart = persistedCartSchema.safeParse({ items: submission.items });

  if (!contact.success || !cart.success || cart.data.items.length === 0) {
    throw new CheckoutSubmissionError("Не удалось проверить данные заявки. Обновите корзину.");
  }

  let response: Response;
  try {
    response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contact: contact.data, cart: { items: cart.data.items } }),
    });
  } catch {
    throw new CheckoutSubmissionError(
      "Нет подключения к сети. Проверьте соединение и попробуйте ещё раз.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (response.status === 409) {
    const conflict = checkoutConflictSchema.safeParse(payload);
    throw new CheckoutSubmissionError(
      "Состав, стоимость или наличие товаров изменились. Проверьте корзину перед повторной отправкой.",
      conflict.success ? conflict.data.issues : [],
    );
  }
  if (!response.ok) {
    throw new CheckoutSubmissionError("Не удалось оформить заявку. Попробуйте ещё раз.");
  }

  const result = checkoutSubmissionResultSchema.safeParse(payload);
  if (!result.success) {
    throw new CheckoutSubmissionError("Сервер вернул некорректное подтверждение заказа.");
  }
  return result.data;
}
