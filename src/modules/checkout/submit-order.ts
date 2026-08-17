import { checkoutFormSchema, type CheckoutFormValues } from "@/modules/checkout/schemas";
import { persistedCartSchema } from "@/modules/cart/schemas";
import type { CartItem } from "@/modules/cart/types";
import { validateCartItem } from "@/modules/cart/validation";

export type CheckoutSubmission = Readonly<{
  contact: CheckoutFormValues;
  items: readonly CartItem[];
}>;

export type CheckoutSubmissionResult = Readonly<{
  orderNumber: string;
}>;

export class CheckoutSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutSubmissionError";
  }
}

function createMockOrderNumber() {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `VS-${suffix}`;
}

/**
 * Temporary typed transport for the frontend stage. The backend order endpoint will replace this
 * implementation without changing the form contract.
 */
export async function submitCheckoutOrder(
  submission: CheckoutSubmission,
): Promise<CheckoutSubmissionResult> {
  const contact = checkoutFormSchema.safeParse(submission.contact);
  const cart = persistedCartSchema.safeParse({ items: submission.items });

  if (!contact.success || !cart.success || cart.data.items.length === 0) {
    throw new CheckoutSubmissionError("Не удалось проверить данные заявки. Обновите корзину.");
  }

  if (cart.data.items.some((item) => validateCartItem(item).status !== "available")) {
    throw new CheckoutSubmissionError(
      "Состав или стоимость корзины изменились. Вернитесь в корзину и проверьте позиции.",
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!navigator.onLine) {
    throw new CheckoutSubmissionError(
      "Нет подключения к сети. Проверьте соединение и попробуйте ещё раз.",
    );
  }

  return { orderNumber: createMockOrderNumber() };
}
