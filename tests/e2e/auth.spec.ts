import { expect, test } from "@playwright/test";

import { addFormaToCart, loginAsUser, userCredentials } from "./support/app";

test("registers an account and accepts a password recovery request", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();

  await page.getByRole("tab", { name: "Регистрация" }).click();
  await expect(page.getByRole("heading", { name: "Создать аккаунт" })).toBeVisible();
  await page.getByLabel("Имя").fill("Анна");
  await page
    .getByLabel("Email")
    .fill(`registration-${testInfo.workerIndex}-${testInfo.retry}-${Date.now()}@example.test`);
  await page.getByLabel("Пароль", { exact: true }).fill(userCredentials(testInfo).password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Вход выполнен" })).toBeVisible();

  await page.goto("/login");
  await page.getByRole("tab", { name: "Восстановление" }).click();
  await page.getByLabel("Email").fill("unknown-account@example.test");
  await page.getByRole("button", { name: "Проверить email" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Если аккаунт существует, запрос подготовлен. Доставка письма пока не настроена.",
  );
});

test("supports keyboard tabs, validation and password autocomplete", async ({ page }) => {
  await page.goto("/login");
  const loginTab = page.getByRole("tab", { name: "Вход" });
  const registrationTab = page.getByRole("tab", { name: "Регистрация" });
  const recoveryTab = page.getByRole("tab", { name: "Восстановление" });

  await expect(page.getByLabel("Пароль", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await loginTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(registrationTab).toBeFocused();
  await expect(registrationTab).toHaveAttribute("aria-selected", "true");
  await expect(registrationTab).toHaveAttribute("aria-controls", "auth-panel");
  await expect(page.getByRole("tabpanel")).toHaveAttribute(
    "aria-labelledby",
    "auth-tab-registration",
  );
  await expect(page.getByLabel("Пароль", { exact: true })).toHaveAttribute(
    "autocomplete",
    "new-password",
  );

  await page.keyboard.press("End");
  await expect(recoveryTab).toBeFocused();
  await page.keyboard.press("Home");
  await expect(loginTab).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(recoveryTab).toBeFocused();

  await loginTab.click();
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByText("Введите email")).toBeVisible();
  await expect(page.getByText("Не менее 8 символов")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
});

test("merges guest and server carts, preserves the server cart on logout and restores it", async ({
  page,
}, testInfo) => {
  await addFormaToCart(page);
  await loginAsUser(page, testInfo);
  await expect(page.locator(".profile-cart-summary").getByText("3", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Выйти из аккаунта" }).click();
  await expect(page.getByRole("heading", { name: "Войдите в аккаунт" })).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("virtual-space:guest-cart:v1")),
    )
    .toContain('"items":[]');

  await addFormaToCart(page);
  await loginAsUser(page, testInfo);
  await expect(page.locator(".profile-cart-summary").getByText("4", { exact: true })).toBeVisible();
});
