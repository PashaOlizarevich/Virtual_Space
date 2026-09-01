"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkoutFormSchema, type CheckoutFormValues } from "@/modules/checkout/schemas";
import {
  CheckoutSubmissionError,
  submitCheckoutOrder,
  type CheckoutSubmissionResult,
} from "@/modules/checkout/submit-order";
import { useCartStore } from "@/modules/cart/store";
import { formatMoney, moneyToNumber } from "@/shared/money";

const defaultValues: CheckoutFormValues = {
  name: "",
  phone: "",
  email: "",
  comment: "",
};

export function CheckoutForm() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const confirmItemPrice = useCartStore((state) => state.confirmItemPrice);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [priceChanges, setPriceChanges] = useState<ReadonlyMap<string, number>>(new Map());
  const [result, setResult] = useState<CheckoutSubmissionResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues,
    shouldFocusError: true,
  });

  async function handleValidSubmit(values: CheckoutFormValues) {
    setSubmissionError(null);
    setPriceChanges(new Map());

    try {
      const submissionResult = await submitCheckoutOrder({ contact: values, items });
      clearCart();
      setResult(submissionResult);
    } catch (error) {
      if (error instanceof CheckoutSubmissionError) {
        setPriceChanges(
          new Map(
            error.issues.flatMap((issue) =>
              issue.code === "PRICE_CHANGED" && issue.currentPrice
                ? [[issue.productId, moneyToNumber(issue.currentPrice)] as const]
                : [],
            ),
          ),
        );
      }
      setSubmissionError(
        error instanceof CheckoutSubmissionError
          ? error.message
          : "Не удалось оформить заявку. Попробуйте ещё раз.",
      );
    }
  }

  function confirmCurrentPrices() {
    for (const item of items) {
      const currentPrice = priceChanges.get(item.productId);
      if (currentPrice !== undefined) confirmItemPrice(item, currentPrice);
    }
    setPriceChanges(new Map());
    setSubmissionError(null);
  }

  if (result) {
    return (
      <section
        className="checkout-form checkout-form__success"
        aria-labelledby="checkout-success-title"
      >
        <CheckCircle2 aria-hidden="true" />
        <div>
          <p className="text-label-caps text-secondary">Заявка принята</p>
          <h2 id="checkout-success-title">Заказ успешно создан</h2>
        </div>
        <p>
          Номер заказа: <strong>{result.orderNumber}</strong>. Мы свяжемся с вами, чтобы подтвердить
          состав, стоимость и доставку.
        </p>
        <p>
          Итоговая стоимость: <strong>{formatMoney(result.total)}</strong>.
        </p>
        <Link className="button button--secondary button--default" href="/catalog">
          Вернуться в каталог
        </Link>
      </section>
    );
  }

  return (
    <form className="checkout-form" noValidate onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="checkout-form__heading">
        <p className="text-label-caps text-secondary">Контактные данные</p>
        <h2>Расскажите, как с вами связаться</h2>
        <p>Обязательные поля отмечены звёздочкой.</p>
      </div>

      {isSubmitted && Object.keys(errors).length > 0 ? (
        <div className="checkout-form__error-summary" role="alert" tabIndex={-1}>
          Проверьте выделенные поля формы.
        </div>
      ) : null}

      {submissionError ? (
        <div className="checkout-form__error-summary" role="alert">
          <p>{submissionError}</p>
          {priceChanges.size ? (
            <Button type="button" variant="secondary" onClick={confirmCurrentPrices}>
              Подтвердить актуальную стоимость
            </Button>
          ) : null}
        </div>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.name) || undefined}>
          <FieldLabel htmlFor="checkout-name">Имя *</FieldLabel>
          <Input
            id="checkout-name"
            autoComplete="name"
            aria-describedby={errors.name ? "checkout-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? (
            <FieldError id="checkout-name-error">{errors.name.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(errors.phone) || undefined}>
          <FieldLabel htmlFor="checkout-phone">Телефон *</FieldLabel>
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+375 29 000-00-00"
            aria-describedby={errors.phone ? "checkout-phone-error" : "checkout-phone-help"}
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone ? (
            <FieldError id="checkout-phone-error">{errors.phone.message}</FieldError>
          ) : (
            <FieldDescription id="checkout-phone-help">
              Номер для уточнения деталей заявки и доставки.
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.email) || undefined}>
          <FieldLabel htmlFor="checkout-email">Email *</FieldLabel>
          <Input
            id="checkout-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-describedby={errors.email ? "checkout-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <FieldError id="checkout-email-error">{errors.email.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={Boolean(errors.comment) || undefined}>
          <FieldLabel htmlFor="checkout-comment">Комментарий</FieldLabel>
          <Textarea
            id="checkout-comment"
            rows={5}
            aria-describedby={errors.comment ? "checkout-comment-error" : "checkout-comment-help"}
            aria-invalid={Boolean(errors.comment)}
            {...register("comment")}
          />
          {errors.comment ? (
            <FieldError id="checkout-comment-error">{errors.comment.message}</FieldError>
          ) : (
            <FieldDescription id="checkout-comment-help">
              Необязательно. До 1000 символов.
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="checkout-form__actions">
        <Button type="submit" disabled={isSubmitting} aria-describedby="checkout-submit-help">
          {isSubmitting ? (
            <>
              <LoaderCircle className="checkout-form__spinner" aria-hidden="true" />
              Отправляем заявку…
            </>
          ) : (
            "Оформить заявку"
          )}
        </Button>
        <p id="checkout-submit-help">
          Перед отправкой проверьте контактные данные и состав корзины.
        </p>
      </div>
    </form>
  );
}
