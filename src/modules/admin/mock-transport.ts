import type { AdminLoginValues } from "@/modules/admin/schemas";
import type { AdminOrder, AdminProduct } from "@/modules/admin/types";
import { adminOrdersPreview, adminProductsPreview } from "@/modules/admin/mock-data";

export async function submitAdminLoginPreview(values: AdminLoginValues): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  if (!navigator.onLine) {
    throw new Error("Нет подключения к интернету. Проверьте сеть и повторите попытку.");
  }

  void values;
}

let previewProducts = structuredClone(adminProductsPreview);

async function previewDelay() {
  await new Promise((resolve) => window.setTimeout(resolve, 250));
  if (!navigator.onLine) throw new Error("Нет подключения к интернету. Повторите попытку.");
}

export async function getAdminProductsPreview(): Promise<AdminProduct[]> {
  await previewDelay();
  return structuredClone(previewProducts);
}

export async function saveAdminProductPreview(product: AdminProduct): Promise<AdminProduct> {
  await previewDelay();
  const existingIndex = previewProducts.findIndex((item) => item.id === product.id);
  if (
    previewProducts.some((item, index) => item.slug === product.slug && index !== existingIndex)
  ) {
    throw new Error("Товар с таким slug уже существует.");
  }
  if (existingIndex === -1) previewProducts = [product, ...previewProducts];
  else previewProducts = previewProducts.map((item) => (item.id === product.id ? product : item));
  return structuredClone(product);
}

export async function deleteAdminProductPreview(productId: string): Promise<void> {
  await previewDelay();
  previewProducts = previewProducts.filter((product) => product.id !== productId);
}

export async function getAdminOrdersPreview(): Promise<AdminOrder[]> {
  await previewDelay();
  return structuredClone(adminOrdersPreview);
}
