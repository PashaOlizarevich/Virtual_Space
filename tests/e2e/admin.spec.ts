import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin");
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
});

test("validates admin login and opens dashboard", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();

  await page.getByRole("button", { name: "Войти в Dashboard" }).click();
  await expect(page.getByText("Неверный логин")).toBeVisible();
  await expect(page.getByText("Неверный пароль")).toBeVisible();

  await page.getByLabel("Логин").fill("admin");
  await page.locator("#admin-password").fill("123");
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

test("creates, edits and deletes a product preview", async ({ page }) => {
  await page.evaluate(() =>
    sessionStorage.setItem("virtual-space:admin-preview-session:v1", "admin"),
  );
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Товары" })).toBeVisible();

  await page.getByRole("button", { name: "Добавить товар" }).click();
  await page.getByLabel("Название").fill("Пуф Solo");
  await page.getByLabel("Slug").fill("solo-pouf");
  await page.getByLabel("Категория").fill("Пуфы");
  await page.getByLabel("Описание").fill("Компактный мягкий пуф для современной гостиной.");
  await page.getByLabel("Цена, BYN").fill("490");
  await page.getByLabel("Остаток").fill("8");
  await page
    .getByLabel("Галерея")
    .setInputFiles({ name: "solo.png", mimeType: "image/png", buffer: Buffer.from("preview") });
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await expect(page.getByRole("row", { name: /Пуф Solo/ })).toBeVisible();

  await page.getByRole("button", { name: "Редактировать Пуф Solo" }).click();
  await page.getByLabel("Остаток").fill("4");
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await expect(page.getByRole("row", { name: /Пуф Solo/ })).toContainText("4 шт.");

  await page.getByRole("button", { name: "Удалить Пуф Solo" }).click();
  await expect(page.getByRole("heading", { name: "Удалить товар?" })).toBeVisible();
  await page.getByRole("button", { name: "Удалить товар", exact: true }).click();
  await expect(page.getByRole("row", { name: /Пуф Solo/ })).toHaveCount(0);
});

test("opens an order and filters the admin order list", async ({ page }) => {
  await page.evaluate(() =>
    sessionStorage.setItem("virtual-space:admin-preview-session:v1", "admin"),
  );
  await page.goto("/admin/orders");

  await expect(page).toHaveTitle(/Заказы/);
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "VS-24042" })).toBeVisible();
  await expect(page.getByText("Диван Forma")).toBeVisible();
  await expect(page.locator(".admin-order-details").getByText("Анна Ковалёва")).toBeVisible();

  await page.getByRole("button", { name: /VS-24031/ }).click();
  await expect(page.getByRole("heading", { name: "VS-24031" })).toBeVisible();
  await expect(page.getByText("Кресло Mono")).toBeVisible();
  await expect(page.getByText("Подтверждён")).toBeVisible();

  await page.getByLabel("Поиск заказов").fill("Мария");
  await expect(page.getByRole("button", { name: /VS-23998/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /VS-24042/ })).toHaveCount(0);
});

test("updates an order through allowed status transitions", async ({ page }) => {
  await page.evaluate(() =>
    sessionStorage.setItem("virtual-space:admin-preview-session:v1", "admin"),
  );
  await page.goto("/admin/orders");

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
