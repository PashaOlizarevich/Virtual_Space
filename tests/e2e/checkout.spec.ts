import { expect, test, type Page } from "@playwright/test";

import { addFormaToCart } from "./support/app";

async function fillCheckoutContact(page: Page): Promise<void> {
  await page.getByLabel("Имя *").fill("Анна");
  await page.getByLabel("Телефон *").fill("+375 29 123-45-67");
  await page.getByLabel("Email *").fill("anna@example.com");
}

test.describe("checkout form", () => {
  test("shows accessible validation errors and focuses the first invalid field", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/checkout");
    await page.getByRole("button", { name: "Оформить заявку" }).click();

    await expect(page.locator(".checkout-form__error-summary")).toHaveText(
      "Проверьте выделенные поля формы.",
    );
    await expect(page.getByLabel("Имя *")).toBeFocused();
    await expect(page.getByLabel("Имя *")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Укажите имя — минимум 2 символа.")).toBeVisible();
    await expect(page.getByText("Укажите номер телефона.")).toBeVisible();
    await expect(page.getByText("Укажите email.")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("shows pending state and confirms a successfully created order", async ({ page }) => {
    await addFormaToCart(page);
    await page.goto("/checkout");
    await fillCheckoutContact(page);
    await page.getByLabel("Комментарий").fill("Позвоните перед доставкой");

    let releaseRequest = () => {};
    let markRequestStarted = () => {};
    const requestStarted = new Promise<void>((resolve) => {
      markRequestStarted = resolve;
    });
    const requestRelease = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    await page.route("**/api/orders", async (route) => {
      markRequestStarted();
      await requestRelease;
      await route.continue();
    });

    await page.getByRole("button", { name: "Оформить заявку" }).click();
    await requestStarted;
    try {
      await expect(page.getByRole("button", { name: "Отправляем заявку…" })).toBeDisabled();
    } finally {
      releaseRequest();
    }

    await expect(page.getByRole("heading", { name: "Заказ успешно создан" })).toBeVisible();
    await expect(page.getByText(/Номер заказа: VS-[A-F0-9]{12}\./)).toBeVisible();
    await expect(page.getByRole("link", { name: "Вернуться в каталог" })).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("virtual-space:guest-cart:v1")),
      )
      .toContain('"items":[]');
  });

  test("keeps entered data and shows a recoverable connection error", async ({ context, page }) => {
    await addFormaToCart(page);
    await page.goto("/checkout");
    await fillCheckoutContact(page);
    await context.setOffline(true);

    try {
      await page.getByRole("button", { name: "Оформить заявку" }).click();
      await expect(
        page.getByText("Нет подключения к сети. Проверьте соединение и попробуйте ещё раз."),
      ).toBeVisible();
      await expect(page.getByLabel("Имя *")).toHaveValue("Анна");
      await expect(page.getByRole("button", { name: "Оформить заявку" })).toBeEnabled();
    } finally {
      await context.setOffline(false);
    }
  });
});
