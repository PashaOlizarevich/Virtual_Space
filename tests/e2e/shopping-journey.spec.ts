import { expect, test } from "@playwright/test";

import { openFormaFromCatalog } from "./support/app";

test("completes the main shopping journey from catalog to order confirmation", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await openFormaFromCatalog(page);
  await expect(page).toHaveTitle(/Кресло Forma/);
  await page.getByLabel("Песочный").check();
  await page.getByRole("button", { name: "Добавить в корзину" }).click();
  await expect(page.getByRole("status")).toContainText("Букле, Песочный");

  await page.getByRole("button", { name: /Открыть корзину, товаров: 1/ }).click();
  await expect(page.getByRole("dialog", { name: "Корзина" })).toBeVisible();
  await expect(page.getByText("Цвет: Песочный")).toBeVisible();
  await page.getByRole("link", { name: "Оформить заявку" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByLabel("Имя *").fill("Анна");
  await page.getByLabel("Телефон *").fill("+375 29 123-45-67");
  await page.getByLabel("Email *").fill("anna@example.com");
  await page.getByRole("button", { name: "Оформить заявку" }).click();

  await expect(page.getByRole("heading", { name: "Заказ успешно создан" })).toBeVisible();
  await expect(page.getByText(/Номер заказа: VS-[A-F0-9]{12}\./)).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("virtual-space:guest-cart:v1")),
    )
    .toContain('"items":[]');
  expect(consoleErrors).toEqual([]);
});
