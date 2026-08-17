import { z } from "zod";

const identifierSchema = z.string().trim().min(1).max(128);

export const cartItemSchema = z
  .object({
    productId: identifierSchema,
    quantity: z.number().int().min(1).max(99),
    selectedOptions: z
      .array(
        z
          .object({
            groupId: identifierSchema,
            optionId: identifierSchema,
          })
          .strict(),
      )
      .max(20),
    observedPrice: z.number().finite().nonnegative().max(100_000_000),
  })
  .strict();

export const persistedCartSchema = z
  .object({
    items: z.array(cartItemSchema).max(100),
  })
  .strict();
