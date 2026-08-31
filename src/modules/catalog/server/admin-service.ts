import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import {
  catalogEntityIdSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  optionCreateSchema,
  optionGroupCreateSchema,
  optionGroupUpdateSchema,
  optionUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  specificationCreateSchema,
  specificationUpdateSchema,
  type CategoryCreateInput,
  type CategoryUpdateInput,
  type OptionCreateInput,
  type OptionGroupCreateInput,
  type OptionGroupUpdateInput,
  type OptionUpdateInput,
  type ProductCreateInput,
  type ProductUpdateInput,
  type SpecificationCreateInput,
  type SpecificationUpdateInput,
} from "@/modules/catalog/server/admin-schemas";
import * as imageLifecycle from "@/modules/catalog/server/image-lifecycle";
import type {
  FinalizeImageUploadInput,
  ReplaceImageInput,
} from "@/modules/catalog/server/image-lifecycle";
import { db } from "@/server/db";

export class CatalogRelationNotFoundError extends Error {
  constructor(relation: "category" | "product" | "optionGroup") {
    super(`Related ${relation} was not found`);
    this.name = "CatalogRelationNotFoundError";
  }
}

export class CatalogDeleteConflictError extends Error {
  constructor(resource: "category") {
    super(`${resource} is still in use`);
    this.name = "CatalogDeleteConflictError";
  }
}

const categoryDtoSelect = { id: true, slug: true, name: true } satisfies Prisma.CategorySelect;
const productDtoSelect = {
  id: true,
  categoryId: true,
  slug: true,
  name: true,
  description: true,
  price: true,
  currency: true,
  stock: true,
  isActive: true,
  newFrom: true,
  newUntil: true,
  material: true,
  style: true,
  dimensions: true,
} satisfies Prisma.ProductSelect;
const specificationDtoSelect = {
  id: true,
  productId: true,
  label: true,
  value: true,
  position: true,
} satisfies Prisma.ProductSpecificationSelect;
const optionGroupDtoSelect = {
  id: true,
  productId: true,
  key: true,
  label: true,
  position: true,
} satisfies Prisma.ProductOptionGroupSelect;
const optionDtoSelect = {
  id: true,
  groupId: true,
  key: true,
  label: true,
  position: true,
} satisfies Prisma.ProductOptionSelect;
const imageDtoSelect = {
  id: true,
  productId: true,
  cloudinaryPublicId: true,
  secureUrl: true,
  alt: true,
  position: true,
} satisfies Prisma.ProductImageSelect;
const productDetailDtoSelect = {
  ...productDtoSelect,
  specifications: { select: specificationDtoSelect, orderBy: { position: "asc" } },
  optionGroups: {
    select: {
      ...optionGroupDtoSelect,
      options: { select: optionDtoSelect, orderBy: { position: "asc" } },
    },
    orderBy: { position: "asc" },
  },
  images: { select: imageDtoSelect, orderBy: { position: "asc" } },
} satisfies Prisma.ProductSelect;

type CatalogDatabase = Pick<
  PrismaClient,
  | "$transaction"
  | "category"
  | "product"
  | "productSpecification"
  | "productOptionGroup"
  | "productOption"
  | "productImage"
>;

const id = (value: string): bigint => BigInt(catalogEntityIdSchema.parse(value));
const serialize = <Record extends { id: bigint }>(record: Record) => ({
  ...record,
  id: record.id.toString(),
});
const serializeChild = <Record extends { id: bigint }, Key extends keyof Record>(
  record: Record,
  parentKey: Key,
) => ({ ...serialize(record), [parentKey]: String(record[parentKey]) });

function serializeProduct<
  Record extends Prisma.ProductGetPayload<{ select: typeof productDtoSelect }>,
>(record: Record) {
  return {
    ...serializeChild(record, "categoryId"),
    price: record.price.toFixed(2),
    newFrom: record.newFrom?.toISOString() ?? null,
    newUntil: record.newUntil?.toISOString() ?? null,
  };
}

async function requireRelation(
  client: Prisma.TransactionClient,
  relation: "category" | "product" | "optionGroup",
  relationId: bigint,
): Promise<void> {
  const found =
    relation === "category"
      ? await client.category.findUnique({ where: { id: relationId }, select: { id: true } })
      : relation === "product"
        ? await client.product.findUnique({ where: { id: relationId }, select: { id: true } })
        : await client.productOptionGroup.findUnique({
            where: { id: relationId },
            select: { id: true },
          });
  if (!found) throw new CatalogRelationNotFoundError(relation);
}

export async function listAdminCategories(database: CatalogDatabase = db) {
  return (
    await database.category.findMany({ select: categoryDtoSelect, orderBy: { name: "asc" } })
  ).map(serialize);
}

export async function createCategory(input: CategoryCreateInput, database: CatalogDatabase = db) {
  const value = categoryCreateSchema.parse(input);
  return serialize(await database.category.create({ data: value, select: categoryDtoSelect }));
}

export async function updateCategory(
  categoryId: string,
  input: CategoryUpdateInput,
  database: CatalogDatabase = db,
) {
  const value = categoryUpdateSchema.parse(input);
  return serialize(
    await database.category.update({
      where: { id: id(categoryId) },
      data: value,
      select: categoryDtoSelect,
    }),
  );
}

export async function deleteCategory(categoryId: string, database: CatalogDatabase = db) {
  return database.$transaction(async (client) => {
    const categoryIdValue = id(categoryId);
    if ((await client.product.count({ where: { categoryId: categoryIdValue } })) > 0) {
      throw new CatalogDeleteConflictError("category");
    }
    return serialize(
      await client.category.delete({ where: { id: categoryIdValue }, select: categoryDtoSelect }),
    );
  });
}

export async function listAdminProducts(database: CatalogDatabase = db) {
  const records = await database.product.findMany({
    select: productDtoSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  return records.map(serializeProduct);
}

export async function getAdminProduct(productId: string, database: CatalogDatabase = db) {
  const record = await database.product.findUnique({
    where: { id: id(productId) },
    select: productDetailDtoSelect,
  });
  if (!record) return null;
  return {
    ...serializeProduct(record),
    specifications: record.specifications.map((item) => serializeChild(item, "productId")),
    optionGroups: record.optionGroups.map((group) => ({
      ...serializeChild(group, "productId"),
      options: group.options.map((item) => serializeChild(item, "groupId")),
    })),
    images: record.images.map((item) => serializeChild(item, "productId")),
  };
}

export async function createProduct(input: ProductCreateInput, database: CatalogDatabase = db) {
  const value = productCreateSchema.parse(input);
  return database.$transaction(async (client) => {
    const categoryId = id(value.categoryId);
    await requireRelation(client, "category", categoryId);
    const record = await client.product.create({
      data: { ...value, categoryId, price: value.price, currency: "BYN" },
      select: productDtoSelect,
    });
    return serializeProduct(record);
  });
}

export async function updateProduct(
  productId: string,
  input: ProductUpdateInput,
  database: CatalogDatabase = db,
) {
  const value = productUpdateSchema.parse(input);
  return database.$transaction(async (client) => {
    const categoryId = value.categoryId ? id(value.categoryId) : undefined;
    if (categoryId) await requireRelation(client, "category", categoryId);
    if (value.newFrom !== undefined || value.newUntil !== undefined) {
      const current = await client.product.findUnique({
        where: { id: id(productId) },
        select: { newFrom: true, newUntil: true },
      });
      const newFrom = value.newFrom === undefined ? current?.newFrom : value.newFrom;
      const newUntil = value.newUntil === undefined ? current?.newUntil : value.newUntil;
      if (newFrom && newUntil && newFrom > newUntil) {
        throw new Error("Invalid new-arrival period");
      }
    }
    const { categoryId: _categoryId, ...fields } = value;
    void _categoryId;
    const record = await client.product.update({
      where: { id: id(productId) },
      data: { ...fields, ...(categoryId ? { categoryId } : {}) },
      select: productDtoSelect,
    });
    return serializeProduct(record);
  });
}

export async function deleteProduct(productId: string, database: CatalogDatabase = db) {
  const result = await database.$transaction(async (client) => {
    const productIdValue = id(productId);
    const orderItemCount = await client.orderItem.count({ where: { productId: productIdValue } });
    if (orderItemCount > 0) {
      return {
        action: "deactivated" as const,
        record: await client.product.update({
          where: { id: productIdValue },
          data: { isActive: false },
          select: productDtoSelect,
        }),
        imagePublicIds: [],
      };
    }
    const record = await client.product.delete({
      where: { id: productIdValue },
      select: {
        ...productDtoSelect,
        images: { select: { cloudinaryPublicId: true } },
      },
    });
    const { images, ...product } = record;
    return {
      action: "deleted" as const,
      record: product,
      imagePublicIds: images.map((image) => image.cloudinaryPublicId),
    };
  });
  const cleanup = await imageLifecycle.deleteProductImageResources(result.imagePublicIds);
  return {
    ...serializeProduct(result.record),
    action: result.action,
    cleanupPending: cleanup.cleanupPending,
    cleanupPublicIds: cleanup.failedPublicIds,
  };
}

export const createImageUploadSignature = (productId: string) =>
  imageLifecycle.createImageUploadSignature(productId);
export const finalizeImageUpload = (input: FinalizeImageUploadInput) =>
  imageLifecycle.finalizeImageUpload(input);
export const replaceManagedImage = (imageId: string, input: ReplaceImageInput) =>
  imageLifecycle.replaceImage(imageId, input);
export const deleteManagedImage = (imageId: string) => imageLifecycle.deleteImage(imageId);

export async function createSpecification(
  input: SpecificationCreateInput,
  database: CatalogDatabase = db,
) {
  const value = specificationCreateSchema.parse(input);
  return database.$transaction(async (client) => {
    const productId = id(value.productId);
    await requireRelation(client, "product", productId);
    return serializeChild(
      await client.productSpecification.create({
        data: { label: value.label, value: value.value, position: value.position, productId },
        select: specificationDtoSelect,
      }),
      "productId",
    );
  });
}

export async function updateSpecification(
  specificationId: string,
  input: SpecificationUpdateInput,
  database: CatalogDatabase = db,
) {
  const value = specificationUpdateSchema.parse(input);
  return serializeChild(
    await database.productSpecification.update({
      where: { id: id(specificationId) },
      data: value,
      select: specificationDtoSelect,
    }),
    "productId",
  );
}
export async function deleteSpecification(specificationId: string, database: CatalogDatabase = db) {
  return serializeChild(
    await database.productSpecification.delete({
      where: { id: id(specificationId) },
      select: specificationDtoSelect,
    }),
    "productId",
  );
}

export async function createOptionGroup(
  input: OptionGroupCreateInput,
  database: CatalogDatabase = db,
) {
  const value = optionGroupCreateSchema.parse(input);
  return database.$transaction(async (client) => {
    const productId = id(value.productId);
    await requireRelation(client, "product", productId);
    return serializeChild(
      await client.productOptionGroup.create({
        data: { key: value.key, label: value.label, position: value.position, productId },
        select: optionGroupDtoSelect,
      }),
      "productId",
    );
  });
}
export async function updateOptionGroup(
  groupId: string,
  input: OptionGroupUpdateInput,
  database: CatalogDatabase = db,
) {
  return serializeChild(
    await database.productOptionGroup.update({
      where: { id: id(groupId) },
      data: optionGroupUpdateSchema.parse(input),
      select: optionGroupDtoSelect,
    }),
    "productId",
  );
}
export async function deleteOptionGroup(groupId: string, database: CatalogDatabase = db) {
  return serializeChild(
    await database.productOptionGroup.delete({
      where: { id: id(groupId) },
      select: optionGroupDtoSelect,
    }),
    "productId",
  );
}

export async function createOption(input: OptionCreateInput, database: CatalogDatabase = db) {
  const value = optionCreateSchema.parse(input);
  return database.$transaction(async (client) => {
    const groupId = id(value.groupId);
    await requireRelation(client, "optionGroup", groupId);
    return serializeChild(
      await client.productOption.create({
        data: { key: value.key, label: value.label, position: value.position, groupId },
        select: optionDtoSelect,
      }),
      "groupId",
    );
  });
}
export async function updateOption(
  optionId: string,
  input: OptionUpdateInput,
  database: CatalogDatabase = db,
) {
  return serializeChild(
    await database.productOption.update({
      where: { id: id(optionId) },
      data: optionUpdateSchema.parse(input),
      select: optionDtoSelect,
    }),
    "groupId",
  );
}
export async function deleteOption(optionId: string, database: CatalogDatabase = db) {
  return serializeChild(
    await database.productOption.delete({ where: { id: id(optionId) }, select: optionDtoSelect }),
    "groupId",
  );
}
