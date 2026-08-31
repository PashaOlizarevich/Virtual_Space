import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

const cloudinaryEnvSchema = z.strictObject({
  cloudName: z.string().trim().min(1),
  apiKey: z.string().trim().min(1),
  apiSecret: z.string().trim().min(1),
});

const cloudinaryResourceSchema = z.object({
  public_id: z.string(),
  resource_type: z.literal("image"),
  format: z.string().toLowerCase(),
  bytes: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  secure_url: z.string().url().startsWith("https://"),
});

const destroyResultSchema = z.object({ result: z.enum(["ok", "not found"]) });

export const PRODUCT_IMAGE_FOLDER = "virtual-space/products";
export const PRODUCT_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;
export const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_DIMENSION = 4_096;

export interface ProductImageResource {
  publicId: string;
  secureUrl: string;
  format: (typeof PRODUCT_IMAGE_FORMATS)[number];
  bytes: number;
  width: number;
  height: number;
}

function getConfig() {
  return cloudinaryEnvSchema.parse({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  });
}

function configure() {
  const config = getConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  });
  return config;
}

export function signProductImageUpload(publicId: string, timestamp: number) {
  const config = configure();
  const uploadParameters = {
    allowed_formats: PRODUCT_IMAGE_FORMATS.join(","),
    public_id: publicId,
    timestamp,
    transformation: `c_limit,w_${PRODUCT_IMAGE_MAX_DIMENSION},h_${PRODUCT_IMAGE_MAX_DIMENSION}`,
  };
  return {
    ...uploadParameters,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    signature: cloudinary.utils.api_sign_request(uploadParameters, config.apiSecret),
  };
}

export async function getProductImageResource(publicId: string): Promise<ProductImageResource> {
  configure();
  const value = cloudinaryResourceSchema.parse(
    await cloudinary.api.resource(publicId, { resource_type: "image", type: "upload" }),
  );
  if (!PRODUCT_IMAGE_FORMATS.includes(value.format as (typeof PRODUCT_IMAGE_FORMATS)[number])) {
    throw new Error("Unsupported Cloudinary image format");
  }
  if (value.bytes > PRODUCT_IMAGE_MAX_BYTES) throw new Error("Cloudinary image exceeds size limit");
  if (value.width > PRODUCT_IMAGE_MAX_DIMENSION || value.height > PRODUCT_IMAGE_MAX_DIMENSION) {
    throw new Error("Cloudinary image exceeds dimension limit");
  }
  return {
    publicId: value.public_id,
    secureUrl: value.secure_url,
    format: value.format as ProductImageResource["format"],
    bytes: value.bytes,
    width: value.width,
    height: value.height,
  };
}

export async function deleteProductImageResource(publicId: string): Promise<void> {
  configure();
  destroyResultSchema.parse(
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    }),
  );
}
