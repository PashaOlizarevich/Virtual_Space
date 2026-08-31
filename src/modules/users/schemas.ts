import { z } from "zod";

export const profileDetailsSchema = z.strictObject({
  name: z.string().trim().min(2, "Введите имя").max(80, "Не более 80 символов"),
  email: z.string().trim().min(1, "Введите email").email("Введите корректный email").max(254),
  phone: z
    .string()
    .trim()
    .min(7, "Введите номер телефона")
    .max(24, "Не более 24 символов")
    .regex(/^[+\d][\d\s()-]+$/, "Введите корректный номер телефона"),
});

export type ProfileDetailsValues = z.infer<typeof profileDetailsSchema>;
