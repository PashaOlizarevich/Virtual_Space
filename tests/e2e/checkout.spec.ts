import { expect, test } from "@playwright/test";

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
    await page.goto("/checkout");
    await page.evaluate(() => {
      localStorage.setItem(
        "virtual-space:guest-cart:v1",
        JSON.stringify({
          state: {
            items: [
              {
                productId: "forma-armchair",
                quantity: 1,
                selectedOptions: [
                  { groupId: "upholstery", optionId: "boucle" },
                  { groupId: "color", optionId: "milk" },
                ],
                observedPrice: 1390,
              },
            ],
          },
          version: 1,
        }),
      );
    });
    await page.reload();
    await page.getByLabel("Имя *").fill("Анна");
    await page.getByLabel("Телефон *").fill("+375 29 123-45-67");
    await page.getByLabel("Email *").fill("anna@example.com");
    await page.getByLabel("Комментарий").fill("Позвоните перед доставкой");
    await page.getByRole("button", { name: "Оформить заявку" }).click();

    await expect(page.getByRole("button", { name: "Отправляем заявку…" })).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Заказ успешно создан" })).toBeVisible();
    await expect(page.getByText(/Номер заказа: VS-[A-F0-9]{8}/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Вернуться в каталог" })).toBeVisible();
    await expect(
      page.evaluate(() => localStorage.getItem("virtual-space:guest-cart:v1")),
    ).resolves.toContain('"items":[]');
  });

  test("keeps entered data and shows a recoverable connection error", async ({ context, page }) => {
    await page.goto("/checkout");
    await page.evaluate(() => {
      localStorage.setItem(
        "virtual-space:guest-cart:v1",
        JSON.stringify({
          state: {
            items: [
              {
                productId: "forma-armchair",
                quantity: 1,
                selectedOptions: [
                  { groupId: "upholstery", optionId: "boucle" },
                  { groupId: "color", optionId: "milk" },
                ],
                observedPrice: 1390,
              },
            ],
          },
          version: 1,
        }),
      );
    });
    await page.reload();
    await page.getByLabel("Имя *").fill("Анна");
    await page.getByLabel("Телефон *").fill("+375 29 123-45-67");
    await page.getByLabel("Email *").fill("anna@example.com");
    await context.setOffline(true);
    await page.getByRole("button", { name: "Оформить заявку" }).click();

    await expect(
      page.getByText("Нет подключения к сети. Проверьте соединение и попробуйте ещё раз."),
    ).toBeVisible();
    await expect(page.getByLabel("Имя *")).toHaveValue("Анна");
    await expect(page.getByRole("button", { name: "Оформить заявку" })).toBeEnabled();
    await context.setOffline(false);
  });
});
