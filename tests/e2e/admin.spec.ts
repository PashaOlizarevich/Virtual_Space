import { expect, test } from "@playwright/test";

import { adminCredentials, loginAsAdmin } from "./support/app";

test("validates admin login and opens dashboard", async ({ page }, testInfo) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();

  await page.getByRole("button", { name: "Войти в Dashboard" }).click();
  await expect(page.getByText("Введите корректную почту")).toBeVisible();
  await expect(page.getByText("Введите пароль")).toBeVisible();

  const credentials = adminCredentials(testInfo);
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Пароль", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Войти в Dashboard" }).click();

  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
  await expect(page.getByText("Всего товаров")).toBeVisible();
});

test("restores an authenticated admin session and signs out", async ({ page }, testInfo) => {
  await loginAsAdmin(page, testInfo);
  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
  await page.getByRole("button", { name: "Выйти" }).click();
  await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();
});

test("edits and deletes an isolated product fixture", async ({ page }, testInfo) => {
  await loginAsAdmin(page, testInfo);
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Товары" })).toBeVisible();

  const productName = `Пуф E2E ${testInfo.retry}`;
  await page.getByLabel("Поиск товаров").fill(productName);
  await expect(page.getByRole("row", { name: new RegExp(productName) })).toBeVisible();

  await page.getByRole("button", { name: `Редактировать ${productName}` }).click();
  await page.getByLabel("Остаток").fill("4");
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await expect(page.getByRole("row", { name: new RegExp(productName) })).toContainText("4 шт.");

  await page.getByRole("button", { name: `Удалить ${productName}` }).click();
  await expect(page.getByRole("heading", { name: "Удалить товар?" })).toBeVisible();
  await page.getByRole("button", { name: "Удалить товар", exact: true }).click();
  await expect(page.getByRole("row", { name: new RegExp(productName) })).toHaveCount(0);
});

test("opens an order and filters the admin order list", async ({ page }, testInfo) => {
  await loginAsAdmin(page, testInfo);
  await page.goto("/admin/orders");

  await expect(page).toHaveTitle(/Заказы/);
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();

  await page.getByRole("button", { name: /VS-E2E00000042/ }).click();
  const details = page.locator(".admin-order-details");
  await expect(details.getByRole("heading", { name: "VS-E2E00000042" })).toBeVisible();
  await expect(details.getByText("Диван Forma")).toBeVisible();
  await expect(details.getByText("Анна Ковалёва")).toBeVisible();

  await page.getByRole("button", { name: /VS-E2E00000031/ }).click();
  await expect(details.getByRole("heading", { name: "VS-E2E00000031" })).toBeVisible();
  await expect(details.getByText("Кресло Mono")).toBeVisible();
  await expect(details.getByText("Подтверждён", { exact: true })).toBeVisible();

  await page.getByLabel("Поиск заказов").fill("Мария");
  await expect(page.getByRole("button", { name: /VS-E2E00000998/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /VS-E2E00000042/ })).toHaveCount(0);
});

test("updates an order through allowed status transitions", async ({ page }, testInfo) => {
  await loginAsAdmin(page, testInfo);
  await page.goto("/admin/orders");
  await page.getByRole("button", { name: new RegExp(`VS-E2ETRANS00${testInfo.retry}`) }).click();

  const details = page.locator(".admin-order-details");
  await expect(details.getByText("Новый", { exact: true })).toBeVisible();
  await expect(details.getByRole("button", { name: "Завершён" })).toHaveCount(0);

  await details.getByRole("button", { name: "Подтверждён" }).click();
  await expect(details.getByText("Подтверждён", { exact: true })).toBeVisible();
  await expect(details.getByRole("button", { name: "В обработке" })).toBeVisible();

  await details.getByRole("button", { name: "В обработке" }).click();
  await expect(details.getByText("В обработке", { exact: true })).toBeVisible();
  await details.getByRole("button", { name: "Завершён" }).click();

  await expect(details.getByText("Завершён", { exact: true })).toBeVisible();
  await expect(details.getByText("Заказ находится в финальном статусе.")).toBeVisible();
  await expect(details.getByRole("button")).toHaveCount(0);
});
