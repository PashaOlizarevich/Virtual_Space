import { expect, test } from "@playwright/test";

test.describe("cart widget", () => {
  test("opens an empty cart and closes it from the overlay", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Открыть корзину" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Корзина" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Корзина", exact: true })).toBeVisible();
    await expect(dialog.getByText("Корзина пока пуста")).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Оформить заявку" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await dialog.click({ position: { x: 8, y: 8 } });
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(consoleErrors).toEqual([]);
  });

  test("updates quantity, total and removes a cart line", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/product/forma-armchair");
    await page.getByLabel("Песочный").check();
    await page.getByRole("button", { name: "Добавить в корзину" }).click();
    await page.getByRole("button", { name: /Открыть корзину/ }).click();

    const dialog = page.getByRole("dialog", { name: "Корзина" });
    await expect(dialog.getByText("Обивка: Букле · Цвет: Песочный")).toBeVisible();
    await expect(dialog.getByText("1 390 Br")).toHaveCount(2);
    await dialog.getByRole("button", { name: "Увеличить количество «Кресло Forma»" }).click();
    await expect(dialog.getByLabel("Количество: 2")).toHaveText("2");
    await expect(dialog.getByText("2 780 Br")).toHaveCount(2);
    await expect(dialog.locator(".cart-widget__summary dl > div").first()).toContainText("2");
    await expect(dialog.getByRole("link", { name: "Оформить заявку" })).toHaveAttribute(
      "href",
      "/checkout",
    );

    await dialog.getByRole("button", { name: "Удалить «Кресло Forma» из корзины" }).click();
    await expect(dialog.getByText("Корзина пока пуста")).toBeVisible();
    await expect(page.getByRole("button", { name: "Открыть корзину" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("blocks checkout until changed prices are confirmed and excludes unavailable items", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "virtual-space:guest-cart:v1",
        JSON.stringify({
          state: {
            items: [
              {
                productId: "forma-armchair",
                quantity: 1,
                selectedOptions: [{ groupId: "color", optionId: "milk" }],
                observedPrice: 1290,
              },
              {
                productId: "removed-product",
                quantity: 1,
                selectedOptions: [],
                observedPrice: 500,
              },
            ],
          },
          version: 1,
        }),
      );
    });

    await page.goto("/");
    await page.getByRole("button", { name: /Открыть корзину/ }).click();

    const dialog = page.getByRole("dialog", { name: "Корзина" });
    await expect(dialog.getByText("Цена изменилась. Подтвердите новую стоимость.")).toBeVisible();
    await expect(
      dialog.getByText("Недоступен — позиция исключена из суммы и оформления."),
    ).toBeVisible();
    await expect(dialog.getByText("1 290 Br")).toBeVisible();
    await expect(dialog.getByText("1 390 Br")).toHaveCount(2);

    const checkout = dialog.getByRole("link", { name: "Оформить заявку" });
    await expect(checkout).toHaveAttribute("aria-disabled", "true");
    await dialog.getByRole("button", { name: "Подтвердить цену" }).click();
    await expect(
      dialog.getByText("Цена изменилась. Подтвердите новую стоимость."),
    ).not.toBeVisible();
    await expect(checkout).not.toHaveAttribute("aria-disabled", "true");
  });
});
