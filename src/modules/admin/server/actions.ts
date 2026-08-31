"use server";

import { revalidatePath } from "next/cache";

import {
  createImageUploadSignature,
  createProduct,
  deleteImage,
  deleteProduct,
  finalizeImageUpload,
  getAdminProduct,
  listAdminCategories,
  listAdminProducts,
  updateProduct,
} from "@/modules/catalog/server/admin";
import type {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/modules/catalog/server/admin-schemas";
import { getAdminStoreSettings, updateAdminStoreSettings } from "@/modules/settings/server/admin";
import type { AdminStoreSettingsUpdateInput } from "@/modules/settings/server/admin-schemas";

export async function loadAdminCatalog() {
  const [categories, products] = await Promise.all([listAdminCategories(), listAdminProducts()]);
  const details = await Promise.all(products.map((product) => getAdminProduct(product.id)));
  return { categories, products: details.filter((product) => product !== null) };
}

export async function saveAdminProductAction(id: string | null, input: ProductCreateInput) {
  const product = id
    ? await updateProduct(id, input satisfies ProductUpdateInput)
    : await createProduct(input);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/catalog", "layout");
  return product;
}

export async function deleteAdminProductAction(id: string) {
  const result = await deleteProduct(id);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/catalog", "layout");
  return result;
}

export async function createAdminImageSignatureAction(productId: string) {
  return createImageUploadSignature(productId);
}

export async function finalizeAdminImageAction(input: {
  productId: string;
  publicId: string;
  alt: string;
  position: number;
}) {
  const image = await finalizeImageUpload(input);
  revalidatePath("/admin/products");
  revalidatePath("/catalog", "layout");
  return image;
}

export async function deleteAdminImageAction(id: string) {
  const result = await deleteImage(id);
  revalidatePath("/admin/products");
  revalidatePath("/catalog", "layout");
  return result;
}

export async function loadAdminSettingsAction() {
  return getAdminStoreSettings();
}

export async function saveAdminSettingsAction(input: AdminStoreSettingsUpdateInput) {
  const settings = await updateAdminStoreSettings(input);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return settings;
}
