import { expect, test } from "@playwright/test";

import { adminCredentials, loginAsAdmin } from "./support/app";

test("validates admin login and opens dashboard", async ({ page }, testInfo) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin$/);
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();

  const loginPanel = page.getByRole("tabpanel");
  await loginPanel.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(loginPanel.getByText("Введите email")).toBeVisible();
  await expect(loginPanel.getByText("Не менее 8 символов")).toBeVisible();

  const credentials = adminCredentials(testInfo);
  await loginPanel.getByLabel("Email").fill(credentials.email);
  await loginPanel.getByLabel("Пароль", { exact: true }).fill(credentials.password);
  await loginPanel.getByRole("button", { name: "Войти", exact: true }).click();

  await expect(page).toHaveURL(/\/admin$/);
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
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();
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
  const orderNumber = `VS-E2ETRANS00${testInfo.retry}`;
  await page.getByRole("button", { name: new RegExp(orderNumber) }).click();

  const details = page.locator(".admin-order-details");
  const updateStatus = async (statusName: string) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) =>
          candidate.request().method() === "PATCH" &&
          new URL(candidate.url()).pathname === `/api/admin/orders/${orderNumber}/status`,
      ),
      details.getByRole("button", { name: statusName }).click(),
    ]);

    expect(
      response.status(),
      `Status update failed for ${orderNumber}: ${await response.text()}`,
    ).toBe(200);
  };

  await expect(details.getByText("Новый", { exact: true })).toBeVisible();
  await expect(details.getByRole("button", { name: "Завершён" })).toHaveCount(0);

  await updateStatus("Подтверждён");
  await expect(details.getByText("Подтверждён", { exact: true })).toBeVisible();
  await expect(details.getByRole("button", { name: "В обработке" })).toBeVisible();

  await updateStatus("В обработке");
  await expect(details.getByText("В обработке", { exact: true })).toBeVisible();
  await updateStatus("Завершён");

  await expect(details.getByText("Завершён", { exact: true })).toBeVisible();
  await expect(details.getByText("Заказ находится в финальном статусе.")).toBeVisible();
  await expect(details.getByRole("button")).toHaveCount(0);
});
