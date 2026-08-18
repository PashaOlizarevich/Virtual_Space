import { z } from "zod";

export const adminLoginSchema = z.object({
  login: z
    .string()
    .trim()
    .refine((value): boolean => value === "admin", "Неверный логин"),
  password: z.string().refine((value): boolean => value === "123", "Неверный пароль"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
