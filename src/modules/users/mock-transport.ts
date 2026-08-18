import { profileDetailsSchema, type ProfileDetailsValues } from "@/modules/users/schemas";

export async function updateProfilePreview(values: ProfileDetailsValues): Promise<void> {
  const parsed = profileDetailsSchema.safeParse(values);
  if (!parsed.success) throw new Error("Проверьте заполнение личных данных.");

  await new Promise((resolve) => window.setTimeout(resolve, 450));
  if (!navigator.onLine)
    throw new Error("Нет подключения к интернету. Проверьте сеть и повторите попытку.");
}
