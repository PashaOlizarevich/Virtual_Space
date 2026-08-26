import { z } from "zod";

export const MAX_FAVORITES = 100;

export const favoriteProductIdSchema = z.string().trim().min(1).max(128);

export const persistedFavoritesSchema = z.object({
  productIds: z.array(favoriteProductIdSchema).max(MAX_FAVORITES),
});
