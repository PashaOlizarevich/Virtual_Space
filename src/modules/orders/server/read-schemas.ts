import { z } from "zod";

const publicOrderNumberSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^VS-[A-Z0-9]{1,32}$/);

export const orderLookupSchema = z.strictObject({
  orderNumber: publicOrderNumberSchema,
  email: z
    .string()
    .trim()
    .max(254)
    .email()
    .transform((value) => value.toLowerCase())
    .optional(),
});

export const adminOrderListSchema = z.strictObject({
  cursor: publicOrderNumberSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export type OrderLookupInput = z.input<typeof orderLookupSchema>;
export type AdminOrderListInput = z.input<typeof adminOrderListSchema>;
