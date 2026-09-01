import { z } from "zod";

const email = z.string().trim().min(1, "Введите email").email("Введите корректный email").max(254);
const password = z.string().min(8, "Не менее 8 символов").max(128, "Не более 128 символов");

export const loginSchema = z.strictObject({ email, password });
export const registrationSchema = z.strictObject({
  name: z.string().trim().min(2, "Введите имя").max(80, "Не более 80 символов"),
  email,
  password,
});
export const recoverySchema = z.strictObject({ email });
export const resetPasswordSchema = z.strictObject({
  token: z.string().min(32, "Некорректная ссылка восстановления").max(256),
  password,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegistrationValues = z.infer<typeof registrationSchema>;
export type RecoveryValues = z.infer<typeof recoverySchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
