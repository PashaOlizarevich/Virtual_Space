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

test("merges guest and server carts, preserves them on logout and restores on re-login", async ({
  page,
}) => {
  const item = {
    productId: "forma-armchair",
    quantity: 1,
    selectedOptions: [{ groupId: "color", optionId: "milk" }],
    observedPrice: 1390,
  };

  await page.addInitScript((cartItem) => {
    if (sessionStorage.getItem("virtual-space:e2e-cart-seeded") === "true") return;
    localStorage.setItem(
      "virtual-space:guest-cart:v1",
      JSON.stringify({ state: { items: [cartItem] }, version: 1 }),
    );
    localStorage.setItem(
      "virtual-space:preview-server-cart:v1",
      JSON.stringify({ items: [{ ...cartItem, quantity: 2 }] }),
    );
    sessionStorage.setItem("virtual-space:e2e-cart-seeded", "true");
  }, item);

  await page.goto("/login");
  await page.getByLabel("Email").fill("anna@example.com");
  await page.getByLabel("Пароль", { exact: true }).fill("password1");
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("Демонстрационный вход выполнен")).toBeVisible();
  await expect(page.locator(".profile-cart-summary").getByText("3", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Выйти из аккаунта" }).click();
  await expect(page.getByText("Гостевой режим", { exact: true })).toBeVisible();
  const afterLogout = await page.evaluate(() => ({
    guest: localStorage.getItem("virtual-space:guest-cart:v1"),
    server: localStorage.getItem("virtual-space:preview-server-cart:v1"),
  }));
  expect(afterLogout.guest).toContain('"items":[]');
  expect(afterLogout.server).toContain('"quantity":3');

  await page.evaluate((cartItem) => {
    localStorage.setItem(
      "virtual-space:guest-cart:v1",
      JSON.stringify({ state: { items: [cartItem] }, version: 1 }),
    );
  }, item);
  await page.goto("/login");
  await page.getByLabel("Email").fill("anna@example.com");
  await page.getByLabel("Пароль", { exact: true }).fill("password1");
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.locator(".profile-cart-summary").getByText("4", { exact: true })).toBeVisible();
});
