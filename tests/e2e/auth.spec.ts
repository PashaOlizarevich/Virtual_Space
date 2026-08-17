import { expect, test } from "@playwright/test";

test("switches auth modes, validates and reports preview success", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();
  await page.getByRole("tab", { name: "Регистрация" }).click();
  await expect(page.getByRole("heading", { name: "Создать аккаунт" })).toBeVisible();
  await page.getByLabel("Имя").fill("Анна");
  await page.getByLabel("Email").fill("anna@example.com");
  await page.getByLabel("Пароль", { exact: true }).fill("password1");
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await expect(page.getByRole("status")).toContainText("Аккаунт не создан");
  await page.getByRole("tab", { name: "Восстановление" }).click();
  await expect(page.getByText("Сейчас письмо не отправляется")).toBeVisible();
});

test("password visibility is accessible", async ({ page }) => {
  await page.goto("/login");
  const password = page.getByLabel("Пароль", { exact: true });
  await password.fill("password1");
  await page.getByRole("button", { name: "Показать пароль" }).click();
  await expect(password).toHaveAttribute("type", "text");
});
