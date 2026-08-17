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

    await expect(page.getByRole("alert").first()).toHaveText("Проверьте выделенные поля формы.");
    await expect(page.getByLabel("Имя *")).toBeFocused();
    await expect(page.getByLabel("Имя *")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Укажите имя — минимум 2 символа.")).toBeVisible();
    await expect(page.getByText("Укажите номер телефона.")).toBeVisible();
    await expect(page.getByText("Укажите email.")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("accepts valid contact data without creating an order", async ({ page }) => {
    await page.goto("/checkout");
    await page.getByLabel("Имя *").fill("Анна");
    await page.getByLabel("Телефон *").fill("+375 29 123-45-67");
    await page.getByLabel("Email *").fill("anna@example.com");
    await page.getByLabel("Комментарий").fill("Позвоните перед доставкой");
    await page.getByRole("button", { name: "Оформить заявку" }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByText("Проверьте выделенные поля формы.")).not.toBeVisible();
    await expect(
      page.getByText("Отправка и создание заказа будут подключены на следующем этапе."),
    ).toBeVisible();
  });

  test("keeps the form usable on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: "Оформление заявки" })).toBeVisible();
    await expect(page.getByLabel("Имя *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Оформить заявку" })).toHaveCSS("width", "358px");
  });
});
