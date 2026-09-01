import { z } from "zod";

const entityIdSchema = z.string().regex(/^[1-9]\d*$/, "Invalid identifier");

export const selectedCartOptionsSchema = z
  .array(
    z.strictObject({
      groupId: z.string().trim().min(1).max(128),
      optionId: z.string().trim().min(1).max(128),
    }),
  )
  .max(20)
  .superRefine((options, context) => {
    const groupIds = options.map(({ groupId }) => groupId);
    if (new Set(groupIds).size !== groupIds.length) {
      context.addIssue({ code: "custom", message: "Each option group may be selected only once" });
    }
  });

export const cartItemIdentitySchema = z.strictObject({
  productId: entityIdSchema,
  selectedOptions: selectedCartOptionsSchema,
});

export const cartQuantityUpdateSchema = cartItemIdentitySchema.extend({
  quantity: z.number().int().min(1).max(99),
});

export const guestCartMergeSchema = z.strictObject({
  items: z.array(cartQuantityUpdateSchema).max(100),
});

export type CartItemIdentityInput = z.infer<typeof cartItemIdentitySchema>;
export type CartQuantityUpdateInput = z.infer<typeof cartQuantityUpdateSchema>;
export type GuestCartMergeInput = z.infer<typeof guestCartMergeSchema>;
