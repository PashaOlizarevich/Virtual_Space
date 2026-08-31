import { z } from "zod";

const idSchema = z.string().regex(/^[1-9]\d*$/, "Invalid identifier");
const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nameSchema = z.string().trim().min(2).max(160);
const positionSchema = z.number().int().min(0).max(10_000);
const nullableDateSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value))
  .nullable();

export const catalogEntityIdSchema = idSchema;

export const categoryCreateSchema = z.strictObject({ slug: slugSchema, name: nameSchema });
export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

const productFieldsSchema = z.strictObject({
  categoryId: idSchema,
  slug: slugSchema,
  name: nameSchema,
  description: z.string().trim().min(10).max(5_000),
  price: z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Invalid decimal price"),
  stock: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
  newFrom: nullableDateSchema,
  newUntil: nullableDateSchema,
  material: z.string().trim().min(1).max(500),
  style: z.string().trim().min(1).max(500),
  dimensions: z.string().trim().min(1).max(500),
});

function validNewPeriod(value: { newFrom?: Date | null; newUntil?: Date | null }): boolean {
  return !value.newFrom || !value.newUntil || value.newFrom <= value.newUntil;
}

export const productCreateSchema = productFieldsSchema.refine(validNewPeriod, {
  message: "newFrom must not be later than newUntil",
  path: ["newUntil"],
});
export const productUpdateSchema = productFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required")
  .refine(validNewPeriod, {
    message: "newFrom must not be later than newUntil",
    path: ["newUntil"],
  });

export const specificationCreateSchema = z.strictObject({
  productId: idSchema,
  label: z.string().trim().min(1).max(160),
  value: z.string().trim().min(1).max(1_000),
  position: positionSchema,
});
export const specificationUpdateSchema = specificationCreateSchema
  .omit({ productId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const optionGroupCreateSchema = z.strictObject({
  productId: idSchema,
  key: slugSchema,
  label: z.string().trim().min(1).max(160),
  position: positionSchema,
});
export const optionGroupUpdateSchema = optionGroupCreateSchema
  .omit({ productId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const optionCreateSchema = z.strictObject({
  groupId: idSchema,
  key: slugSchema,
  label: z.string().trim().min(1).max(160),
  position: positionSchema,
});
export const optionUpdateSchema = optionCreateSchema
  .omit({ groupId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const imageCreateSchema = z.strictObject({
  productId: idSchema,
  cloudinaryPublicId: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9/_-]+$/),
  secureUrl: z
    .string()
    .url()
    .max(2_048)
    .refine((value) => value.startsWith("https://")),
  alt: z.string().trim().min(1).max(300),
  position: positionSchema,
});
export const imageUpdateSchema = imageCreateSchema
  .omit({ productId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export type CategoryCreateInput = z.input<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.input<typeof categoryUpdateSchema>;
export type ProductCreateInput = z.input<typeof productCreateSchema>;
export type ProductUpdateInput = z.input<typeof productUpdateSchema>;
export type SpecificationCreateInput = z.input<typeof specificationCreateSchema>;
export type SpecificationUpdateInput = z.input<typeof specificationUpdateSchema>;
export type OptionGroupCreateInput = z.input<typeof optionGroupCreateSchema>;
export type OptionGroupUpdateInput = z.input<typeof optionGroupUpdateSchema>;
export type OptionCreateInput = z.input<typeof optionCreateSchema>;
export type OptionUpdateInput = z.input<typeof optionUpdateSchema>;
export type ImageCreateInput = z.input<typeof imageCreateSchema>;
export type ImageUpdateInput = z.input<typeof imageUpdateSchema>;
