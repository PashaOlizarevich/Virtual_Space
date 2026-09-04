import { expect, test } from "@playwright/test";

import { addFormaToCart, loginAsUser, userCredentials } from "./support/app";

test("registers an account and accepts a password recovery request", async ({ page }, testInfo) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();

  await page.getByRole("tab", { name: "Регистрация" }).click();
  const registrationPanel = page.getByRole("tabpanel");
  await expect(registrationPanel.getByRole("heading", { name: "Создать аккаунт" })).toBeVisible();
  await registrationPanel.getByLabel("Имя").fill("Анна");
  await registrationPanel
    .getByLabel("Email")
    .fill(`registration-${testInfo.workerIndex}-${testInfo.retry}-${Date.now()}@example.test`);
  await registrationPanel
    .getByLabel("Пароль", { exact: true })
    .fill(userCredentials(testInfo).password);
  await registrationPanel.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Вход выполнен" })).toBeVisible();

  await page.goto("/login");
  await page.getByRole("button", { name: "Забыли пароль?" }).click();
  const recoveryDialog = page.getByRole("dialog", { name: "Восстановить пароль" });
  await expect(recoveryDialog).toBeVisible();
  await recoveryDialog.getByLabel("Email").fill("unknown-account@example.test");
  await recoveryDialog.getByRole("button", { name: "Отправить ссылку" }).click();
  await expect(recoveryDialog.getByRole("status")).toContainText(
    "Если аккаунт существует, запрос подготовлен. Доставка письма пока не настроена.",
  );
});

test("supports keyboard tabs, validation and password autocomplete", async ({ page }) => {
  await page.goto("/login");
  const loginTab = page.getByRole("tab", { name: "Вход" });
  const registrationTab = page.getByRole("tab", { name: "Регистрация" });
  const authPanel = page.getByRole("tabpanel");

  await expect(page.getByLabel("Пароль", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await loginTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(registrationTab).toBeFocused();
  await expect(registrationTab).toHaveAttribute("aria-selected", "true");
  await expect(registrationTab).toHaveAttribute("aria-controls", "auth-panel");
  await expect(authPanel).toHaveAttribute("aria-labelledby", "auth-tab-registration");
  await expect(authPanel.getByLabel("Пароль", { exact: true })).toHaveAttribute(
    "autocomplete",
    "new-password",
  );

  await page.keyboard.press("End");
  await expect(registrationTab).toBeFocused();
  await page.keyboard.press("Home");
  await expect(loginTab).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(registrationTab).toBeFocused();

  await page.keyboard.press("Home");
  const recoveryButton = authPanel.getByRole("button", { name: "Забыли пароль?" });
  await recoveryButton.focus();
  await page.keyboard.press("Enter");

  const recoveryDialog = page.getByRole("dialog", { name: "Восстановить пароль" });
  await expect(recoveryDialog).toBeVisible();
  await expect(recoveryDialog.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(recoveryDialog).toBeHidden();
  await expect(recoveryButton).toBeFocused();

  await authPanel.getByRole("button", { name: "Войти" }).click();
  await expect(authPanel.getByText("Введите email")).toBeVisible();
  await expect(authPanel.getByText("Не менее 8 символов")).toBeVisible();
  await expect(authPanel.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
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
