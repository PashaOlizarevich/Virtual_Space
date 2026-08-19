import { expect, test } from "@playwright/test";

test.describe("catalog and product", () => {
  test("opens the tableware category from the catalog menu", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("button", { name: "Каталог", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Категории" })
      .getByRole("link", { name: "Посуда" })
      .click();

    await expect(page).toHaveURL(/\/catalog\/tableware$/);
    await expect(page).toHaveTitle(/Посуда/);
    await expect(page.getByRole("heading", { name: "Посуда", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Набор тарелок Lumo", level: 3 })).toBeVisible();
    await expect(page.locator(".tableware-page .product-preview")).toHaveCount(1);
  });

  test("loads and refreshes the cached catalog", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.getByText("В коллекции: 4")).toBeVisible();
    await page.getByRole("button", { name: "Обновить" }).click();
    await expect(page.getByText("Обновляем коллекцию…")).toBeVisible();
    await expect(page.getByText("В коллекции: 4")).toBeVisible();
    await expect(page.locator(".product-preview")).toHaveCount(4);
  });

  test("opens a product and adds the selected configuration", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/catalog");
    await expect(page).toHaveTitle(/Каталог/);
    await expect(page.getByRole("heading", { name: "Мебель для спокойного дома" })).toBeVisible();
    await page.getByRole("link", { name: "Подробнее" }).first().click();

    await expect(page).toHaveURL(/\/product\/forma-chair$/);
    await expect(page.getByRole("heading", { name: "Кресло Forma" })).toBeVisible();
    await page.getByLabel("Песочный").check();
    await page.getByRole("button", { name: "Добавить в корзину" }).click();
    await expect(page.getByRole("status")).toContainText("Букле, Песочный");
    await page.reload();
    const persistedCart = await page.evaluate(() =>
      window.localStorage.getItem("virtual-space:guest-cart:v1"),
    );
    expect(persistedCart).toContain('"productId":"forma-chair"');
    expect(persistedCart).toContain('"optionId":"sand"');
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the product page usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/product/modul-sofa");
    await expect(page.getByRole("heading", { name: "Диван Modul" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить в корзину" })).toBeVisible();
  });
});
