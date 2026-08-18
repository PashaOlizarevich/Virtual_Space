import { z } from "zod";

export const adminLoginSchema = z.object({
  login: z
    .string()
    .trim()
    .refine((value): boolean => value === "admin", "Неверный логин"),
  password: z.string().refine((value): boolean => value === "123", "Неверный пароль"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, "Введите название").max(80, "Не более 80 символов"),
  slug: z
    .string()
    .trim()
    .min(2, "Введите slug")
    .max(80, "Не более 80 символов")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Используйте латиницу, цифры и дефисы"),
  category: z.string().trim().min(2, "Введите категорию").max(50, "Не более 50 символов"),
  description: z.string().trim().min(10, "Минимум 10 символов").max(500, "Не более 500 символов"),
  price: z.number().positive("Цена должна быть больше нуля").max(1_000_000),
  stock: z.number().int("Введите целое число").min(0, "Не меньше нуля").max(100_000),
  published: z.boolean(),
});

export const ADMIN_PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ADMIN_PRODUCT_IMAGE_LIMIT = 5;
export const ADMIN_PRODUCT_IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;

export const adminProductImagesSchema = z
  .array(
    z
      .instanceof(File)
      .refine(
        (file) =>
          ADMIN_PRODUCT_IMAGE_TYPES.includes(
            file.type as (typeof ADMIN_PRODUCT_IMAGE_TYPES)[number],
          ),
        "Допустимы JPG, PNG и WebP",
      )
      .refine(
        (file) => file.size <= ADMIN_PRODUCT_IMAGE_SIZE_LIMIT,
        "Файл должен быть не больше 5 МБ",
      ),
  )
  .max(ADMIN_PRODUCT_IMAGE_LIMIT, `Не более ${ADMIN_PRODUCT_IMAGE_LIMIT} изображений`);

export type AdminProductValues = z.infer<typeof adminProductSchema>;

export const adminOrderStatusSchema = z.enum([
  "new",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
]);

export const adminOrderStatusUpdateSchema = z.strictObject({
  orderId: z.string().trim().min(1).max(40),
  status: adminOrderStatusSchema,
});

export type AdminOrderStatusUpdate = z.infer<typeof adminOrderStatusUpdateSchema>;

const optionalSocialUrl = z.union([
  z.literal(""),
  z.string().trim().url("Введите полный адрес, начиная с https://").max(200),
]);

export const adminStoreSettingsSchema = z.strictObject({
  name: z.string().trim().min(2, "Введите название").max(80, "Не более 80 символов"),
  description: z.string().trim().min(20, "Минимум 20 символов").max(600, "Не более 600 символов"),
  phone: z.string().trim().min(7, "Введите телефон").max(30, "Не более 30 символов"),
  email: z.string().trim().email("Введите корректную почту").max(120),
  workingHours: z.string().trim().min(3, "Введите часы работы").max(120),
  address: z.string().trim().min(5, "Введите адрес").max(200),
  instagram: optionalSocialUrl,
  pinterest: optionalSocialUrl,
  telegram: optionalSocialUrl,
});

export type AdminStoreSettingsValues = z.infer<typeof adminStoreSettingsSchema>;
