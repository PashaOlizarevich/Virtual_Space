export type AuthMode = "login" | "registration" | "recovery";

export async function submitAuthPreview(mode: AuthMode): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 450));
  if (!navigator.onLine)
    throw new Error("Нет подключения к интернету. Проверьте сеть и повторите попытку.");
  void mode;
}
