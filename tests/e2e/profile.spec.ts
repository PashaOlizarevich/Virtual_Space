import { expect, test, type Page } from "@playwright/test";

import { loginAsUser } from "./support/app";

function trackRuntimeErrors(page: Page) {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  return runtimeErrors;
}

test("shows profile dashboard and validates personal details", async ({ page }, testInfo) => {
  const runtimeErrors = trackRuntimeErrors(page);
  await loginAsUser(page, testInfo);

  await expect(page.getByRole("heading", { name: "Ваш личный кабинет" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Вход выполнен" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Корзина" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();
  await expect(page.getByText("В работе", { exact: true })).toBeVisible();

  await page.getByLabel("Имя").fill("А");
  await page.getByLabel("Email").fill("wrong");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.getByText("Введите имя")).toBeVisible();
  await expect(page.getByText("Введите корректный email")).toBeVisible();
  await expect(page.getByLabel("Имя")).toHaveAttribute("aria-invalid", "true");
  expect(runtimeErrors).toEqual([]);
});
