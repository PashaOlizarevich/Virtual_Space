import { expect, test } from "@playwright/test";

test.describe("catalog and product", () => {
  test("loads and refreshes the cached catalog", async ({ page }) => {
    await page.goto("/catalog");
    await expect(page.getByText("В коллекции: 4")).toBeVisible();
    await page.getByRole("button", { name: "Обновить" }).click();
    await expect(page.getByText("Обновляем коллекцию…")).toBeVisible();
    await expect(page.getByText("В коллекции: 4")).toBeVisible();
  });

  test("opens a product and persists the selected configuration", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("link", { name: "Подробнее" }).first().click();
    await expect(page).toHaveURL(/\/product\/forma-armchair$/);
    await page.getByLabel("Песочный").check();
    await page.getByRole("button", { name: "Добавить в корзину" }).click();
    await expect(page.getByRole("status")).toContainText("Букле, Песочный");
    await page.reload();
    const persistedCart = await page.evaluate(() =>
      window.localStorage.getItem("virtual-space:guest-cart:v1"),
    );
    expect(persistedCart).toContain('"productId":"forma-armchair"');
    expect(persistedCart).toContain('"optionId":"sand"');
  });
});
