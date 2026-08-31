import { z } from "zod";

const entityIdSchema = z.string().regex(/^[1-9]\d*$/, "Invalid identifier");

export const guestCartItemSchema = z
  .strictObject({
    productId: entityIdSchema,
    quantity: z.number().int().min(1).max(99),
    selectedOptions: z
      .array(
        z.strictObject({
          groupId: z.string().trim().min(1).max(128),
          optionId: z.string().trim().min(1).max(128),
        }),
      )
      .max(20),
    observedPrice: z.number().finite().nonnegative().max(100_000_000),
  })
  .superRefine((item, context) => {
    const groupIds = item.selectedOptions.map(({ groupId }) => groupId);

    if (new Set(groupIds).size !== groupIds.length) {
      context.addIssue({
        code: "custom",
        message: "Each option group may be selected only once",
        path: ["selectedOptions"],
      });
    }
  });

export const guestCartValidationSchema = z.strictObject({
  items: z.array(guestCartItemSchema).min(1).max(100),
});

export type GuestCartValidationInput = z.input<typeof guestCartValidationSchema>;

const phoneCharacters = /^[+()\d\s-]+$/;

export const createGuestOrderSchema = z.strictObject({
  contact: z.strictObject({
    name: z.string().trim().min(2).max(100),
    phone: z
      .string()
      .trim()
      .min(1)
      .max(32)
      .regex(phoneCharacters)
      .refine((value) => {
        const digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
      }),
    email: z.string().trim().min(1).max(254).email(),
    comment: z.string().trim().max(1000),
  }),
  cart: guestCartValidationSchema,
});

export type CreateGuestOrderInput = z.input<typeof createGuestOrderSchema>;
