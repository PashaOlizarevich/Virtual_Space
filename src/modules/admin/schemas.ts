import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().min(1, "Введите email").email("Введите корректный email").max(254),
  password: z.string().min(8, "Не менее 8 символов").max(128, "Не более 128 символов"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
