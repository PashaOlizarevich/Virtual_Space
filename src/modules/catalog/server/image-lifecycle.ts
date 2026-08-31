import "server-only";

import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

import { catalogEntityIdSchema } from "@/modules/catalog/server/admin-schemas";
import { db } from "@/server/db";
import {
  PRODUCT_IMAGE_FOLDER,
  deleteProductImageResource,
  getProductImageResource,
  signProductImageUpload,
  type ProductImageResource,
} from "@/server/integrations/cloudinary";

const publicIdSchema = z.string().regex(/^virtual-space\/products\/[1-9]\d*\/[0-9a-f-]{36}$/);
const finalizeSchema = z.strictObject({
  productId: catalogEntityIdSchema,
  publicId: publicIdSchema,
  alt: z.string().trim().min(1).max(300),
  position: z.number().int().min(0).max(10_000),
});

const replaceSchema = finalizeSchema.omit({ productId: true, position: true });
const imageSelect = {
  id: true,
  productId: true,
  cloudinaryPublicId: true,
  secureUrl: true,
  alt: true,
  position: true,
} satisfies Prisma.ProductImageSelect;

type ImageDatabase = Pick<PrismaClient, "$transaction" | "product" | "productImage">;
type CloudinaryPort = {
  sign: typeof signProductImageUpload;
  get: typeof getProductImageResource;
  delete: typeof deleteProductImageResource;
};

const defaultCloudinary: CloudinaryPort = {
  sign: signProductImageUpload,
  get: getProductImageResource,
  delete: deleteProductImageResource,
};

const serialize = (image: Prisma.ProductImageGetPayload<{ select: typeof imageSelect }>) => ({
  ...image,
  id: image.id.toString(),
  productId: image.productId.toString(),
});

function id(value: string) {
  return BigInt(catalogEntityIdSchema.parse(value));
}

function assertOwnedResource(resource: ProductImageResource, publicId: string) {
  if (resource.publicId !== publicId) throw new Error("Cloudinary resource identity mismatch");
}

async function deleteIfUnpersisted(
  publicId: string,
  database: ImageDatabase,
  cloudinaryPort: CloudinaryPort,
) {
  const persisted = await database.productImage.findUnique({
    where: { cloudinaryPublicId: publicId },
    select: { id: true },
  });
  if (!persisted) await cloudinaryPort.delete(publicId).catch(() => undefined);
}

export async function createImageUploadSignature(
  productId: string,
  database: ImageDatabase = db,
  cloudinaryPort: CloudinaryPort = defaultCloudinary,
) {
  const parsedProductId = catalogEntityIdSchema.parse(productId);
  const product = await database.product.findUnique({
    where: { id: id(parsedProductId) },
    select: { id: true },
  });
  if (!product) throw new Error("Related product was not found");
  const publicId = `${PRODUCT_IMAGE_FOLDER}/${parsedProductId}/${randomUUID()}`;
  return { publicId, ...cloudinaryPort.sign(publicId, Math.floor(Date.now() / 1000)) };
}

export async function finalizeImageUpload(
  input: z.input<typeof finalizeSchema>,
  database: ImageDatabase = db,
  cloudinaryPort: CloudinaryPort = defaultCloudinary,
) {
  const value = finalizeSchema.parse(input);
  const resource = await cloudinaryPort.get(value.publicId);
  assertOwnedResource(resource, value.publicId);
  try {
    const image = await database.$transaction(async (client) => {
      const productId = id(value.productId);
      const product = await client.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) throw new Error("Related product was not found");
      return client.productImage.create({
        data: {
          productId,
          cloudinaryPublicId: resource.publicId,
          secureUrl: resource.secureUrl,
          alt: value.alt,
          position: value.position,
        },
        select: imageSelect,
      });
    });
    return serialize(image);
  } catch (error) {
    await deleteIfUnpersisted(value.publicId, database, cloudinaryPort);
    throw error;
  }
}

export async function replaceImage(
  imageId: string,
  input: z.input<typeof replaceSchema>,
  database: ImageDatabase = db,
  cloudinaryPort: CloudinaryPort = defaultCloudinary,
) {
  const value = replaceSchema.parse(input);
  const resource = await cloudinaryPort.get(value.publicId);
  assertOwnedResource(resource, value.publicId);
  let previousPublicId: string | undefined;
  try {
    const image = await database.$transaction(async (client) => {
      const previous = await client.productImage.findUnique({
        where: { id: id(imageId) },
        select: imageSelect,
      });
      if (!previous) throw new Error("Image was not found");
      const expectedPrefix = `${PRODUCT_IMAGE_FOLDER}/${previous.productId.toString()}/`;
      if (!resource.publicId.startsWith(expectedPrefix))
        throw new Error("Cloudinary resource belongs to another product");
      previousPublicId = previous.cloudinaryPublicId;
      return client.productImage.update({
        where: { id: previous.id },
        data: {
          cloudinaryPublicId: resource.publicId,
          secureUrl: resource.secureUrl,
          alt: value.alt,
        },
        select: imageSelect,
      });
    });
    try {
      await cloudinaryPort.delete(previousPublicId!);
      return { ...serialize(image), cleanupPending: false };
    } catch {
      return { ...serialize(image), cleanupPending: true, cleanupPublicId: previousPublicId };
    }
  } catch (error) {
    if (!previousPublicId) await deleteIfUnpersisted(value.publicId, database, cloudinaryPort);
    throw error;
  }
}

export async function deleteImage(
  imageId: string,
  database: ImageDatabase = db,
  cloudinaryPort: CloudinaryPort = defaultCloudinary,
) {
  const image = await database.productImage.delete({
    where: { id: id(imageId) },
    select: imageSelect,
  });
  try {
    await cloudinaryPort.delete(image.cloudinaryPublicId);
    return { ...serialize(image), cleanupPending: false };
  } catch {
    return {
      ...serialize(image),
      cleanupPending: true,
      cleanupPublicId: image.cloudinaryPublicId,
    };
  }
}

export async function deleteProductImageResources(
  publicIds: readonly string[],
  cloudinaryPort: CloudinaryPort = defaultCloudinary,
) {
  const failedPublicIds: string[] = [];
  for (const publicId of publicIds) {
    try {
      await cloudinaryPort.delete(publicId);
    } catch {
      failedPublicIds.push(publicId);
    }
  }
  return { cleanupPending: failedPublicIds.length > 0, failedPublicIds };
}

export type FinalizeImageUploadInput = z.input<typeof finalizeSchema>;
export type ReplaceImageInput = z.input<typeof replaceSchema>;
