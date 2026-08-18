import type { AdminLoginValues } from "@/modules/admin/schemas";

export async function submitAdminLoginPreview(values: AdminLoginValues): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  if (!navigator.onLine) {
    throw new Error("Нет подключения к интернету. Проверьте сеть и повторите попытку.");
  }

  void values;
}
