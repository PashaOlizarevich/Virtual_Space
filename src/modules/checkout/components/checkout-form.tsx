"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkoutFormSchema, type CheckoutFormValues } from "@/modules/checkout/schemas";

const defaultValues: CheckoutFormValues = {
  name: "",
  phone: "",
  email: "",
  comment: "",
};

export function CheckoutForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues,
    shouldFocusError: true,
  });

  return (
    <form className="checkout-form" noValidate onSubmit={handleSubmit(() => undefined)}>
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
        <Button type="submit">Оформить заявку</Button>
        <p>Отправка и создание заказа будут подключены на следующем этапе.</p>
      </div>
    </form>
  );
}
