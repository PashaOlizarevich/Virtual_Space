import { z } from "zod";

const phoneCharacters = /^[+()\d\s-]+$/;

export const checkoutFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Укажите имя — минимум 2 символа.")
      .max(100, "Имя слишком длинное."),
    phone: z
      .string()
      .trim()
      .min(1, "Укажите номер телефона.")
      .max(32, "Номер телефона слишком длинный.")
      .regex(phoneCharacters, "Используйте цифры и символы +, пробел, скобки или дефис.")
      .refine((value) => {
        const digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
      }, "Укажите номер телефона от 7 до 15 цифр."),
    email: z
      .string()
      .trim()
      .min(1, "Укажите email.")
      .max(254, "Email слишком длинный.")
      .email("Введите корректный email."),
    comment: z.string().trim().max(1000, "Комментарий не должен превышать 1000 символов."),
  })
  .strict();

export type CheckoutFormValues = z.input<typeof checkoutFormSchema>;
