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
