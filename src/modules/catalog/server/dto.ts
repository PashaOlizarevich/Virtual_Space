import { z } from "zod";

const identifierSchema = z.string().trim().min(1).max(128);
const labelSchema = z.string().trim().min(1).max(160);
const textSchema = z.string().trim().min(1).max(5_000);
const isoDateTimeSchema = z.iso.datetime({ offset: true });
const imageSourceSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_048)
  .refine((value) => value.startsWith("/") || value.startsWith("https://"));

export const catalogMoneyDtoSchema = z.strictObject({
  amount: z.string().regex(/^\d{1,10}\.\d{2}$/),
  currency: z.literal("BYN"),
});

export const categoryDtoSchema = z.strictObject({
  slug: identifierSchema,
  name: labelSchema,
});

export const productImageDtoSchema = z.strictObject({
  src: imageSourceSchema,
  alt: z.string().trim().max(300),
});

export const productSpecificationDtoSchema = z.strictObject({
  label: labelSchema,
  value: z.string().trim().min(1).max(500),
});

export const productOptionDtoSchema = z.strictObject({
  id: identifierSchema,
  label: labelSchema,
});

export const productOptionGroupDtoSchema = z.strictObject({
  id: identifierSchema,
  label: labelSchema,
  options: z.array(productOptionDtoSchema).max(100),
});

export const productPreviewDtoSchema = z.strictObject({
  id: identifierSchema,
  slug: identifierSchema,
  name: labelSchema,
  description: textSchema,
  price: catalogMoneyDtoSchema,
  image: imageSourceSchema,
  imageAlt: z.string().trim().max(300),
  newFrom: isoDateTimeSchema.nullable(),
  newUntil: isoDateTimeSchema.nullable(),
});

export const productDtoSchema = productPreviewDtoSchema.extend({
  gallery: z.array(productImageDtoSchema).max(20),
  specifications: z.array(productSpecificationDtoSchema).max(100),
  optionGroups: z.array(productOptionGroupDtoSchema).max(30),
});

export const catalogDtoSchema = z.strictObject({
  categories: z.array(categoryDtoSchema).max(100),
  products: z.array(productPreviewDtoSchema).max(500),
});

export type CatalogMoneyDto = z.infer<typeof catalogMoneyDtoSchema>;
export type CategoryDto = z.infer<typeof categoryDtoSchema>;
export type ProductPreviewDto = z.infer<typeof productPreviewDtoSchema>;
export type ProductDto = z.infer<typeof productDtoSchema>;
export type CatalogDto = z.infer<typeof catalogDtoSchema>;
