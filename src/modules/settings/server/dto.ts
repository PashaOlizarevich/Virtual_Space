import { z } from "zod";

const publicHrefSchema = z
  .string()
  .trim()
  .max(2_048)
  .refine((value) => /^(?:https:\/\/|mailto:|tel:)/i.test(value), "Unsupported public URL");

export const storeContactDtoSchema = z.strictObject({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(300),
  href: publicHrefSchema.optional(),
});

export const storeSocialDtoSchema = z.strictObject({
  label: z.string().trim().min(1).max(80),
  href: z
    .string()
    .trim()
    .url()
    .max(2_048)
    .refine((value) => value.startsWith("https://")),
});

export const publicStoreSettingsDtoSchema = z.strictObject({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5_000),
  contacts: z.array(storeContactDtoSchema).max(50),
  socials: z.array(storeSocialDtoSchema).max(30),
});

export type StoreContactDto = z.infer<typeof storeContactDtoSchema>;
export type StoreSocialDto = z.infer<typeof storeSocialDtoSchema>;
export type PublicStoreSettingsDto = z.infer<typeof publicStoreSettingsDtoSchema>;
