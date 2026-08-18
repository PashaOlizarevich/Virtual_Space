import {
  adminOrderStatusUpdateSchema,
  adminStoreSettingsSchema,
  type AdminLoginValues,
  type AdminOrderStatusUpdate,
  type AdminStoreSettingsValues,
} from "@/modules/admin/schemas";
import {
  canTransitionAdminOrderStatus,
  type AdminOrder,
  type AdminProduct,
  type AdminStoreSettings,
} from "@/modules/admin/types";
import {
  adminOrdersPreview,
  adminProductsPreview,
  adminStoreSettingsPreview,
} from "@/modules/admin/mock-data";

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
  return structuredClone(previewOrders);
}

let previewOrders = structuredClone(adminOrdersPreview);

export async function updateAdminOrderStatusPreview(
  input: AdminOrderStatusUpdate,
): Promise<AdminOrder> {
  await previewDelay();
  const update = adminOrderStatusUpdateSchema.parse(input);
  const order = previewOrders.find((item) => item.id === update.orderId);

  if (!order) throw new Error("Заказ не найден. Обновите список и повторите попытку.");
  if (!canTransitionAdminOrderStatus(order.status, update.status)) {
    throw new Error("Этот переход статуса недоступен для текущего состояния заказа.");
  }

  const updatedOrder = { ...order, status: update.status };
  previewOrders = previewOrders.map((item) => (item.id === order.id ? updatedOrder : item));
  return structuredClone(updatedOrder);
}

let previewStoreSettings = structuredClone(adminStoreSettingsPreview);

export async function getAdminStoreSettingsPreview(): Promise<AdminStoreSettings> {
  await previewDelay();
  return structuredClone(previewStoreSettings);
}

export async function saveAdminStoreSettingsPreview(
  values: AdminStoreSettingsValues,
): Promise<AdminStoreSettings> {
  await previewDelay();
  previewStoreSettings = adminStoreSettingsSchema.parse(values);
  return structuredClone(previewStoreSettings);
}
