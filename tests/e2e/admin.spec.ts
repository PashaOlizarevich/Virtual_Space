import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
});

test("validates admin login and opens dashboard", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();

  await page.getByRole("button", { name: "Войти в Dashboard" }).click();
  await expect(page.getByText("Введите email")).toBeVisible();
  await expect(page.getByText("Не менее 8 символов")).toBeVisible();

  await page.getByLabel("Email").fill("admin@example.com");
  await page.locator("#admin-password").fill("password1");
  await page.getByRole("button", { name: "Войти в Dashboard" }).click();

  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
  await expect(page.getByText("Новые заказы")).toBeVisible();
});

test("restores admin preview session and signs out", async ({ page }) => {
  await page.evaluate(() =>
    sessionStorage.setItem("virtual-space:admin-preview-session:v1", "admin"),
  );
  await page.reload();

  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();
});
