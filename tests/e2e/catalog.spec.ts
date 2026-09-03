import { expect, test } from "@playwright/test";

import { openFormaFromCatalog } from "./support/app";

test.describe("catalog and product", () => {
  test("loads the database catalog and reloads it", async ({ page }) => {
    await page.goto("/catalog");
    await expect(
      page.getByRole("heading", { name: "Пространство, собранное вокруг вас" }),
    ).toBeVisible();

    const collectionCount = page.getByText(/^В коллекции: \d+$/);
    const countBeforeReload = await collectionCount.textContent();
    if (!countBeforeReload) throw new Error("The catalog item count was not rendered.");

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().isNavigationRequest() &&
          new URL(response.url()).pathname === "/catalog" &&
          response.ok(),
      ),
      page.getByRole("button", { name: "Обновить" }).click(),
    ]);
    await expect(collectionCount).toHaveText(countBeforeReload);
  });

  test("opens a product and persists the selected configuration", async ({ page }) => {
    await openFormaFromCatalog(page);
    await page.getByLabel("Песочный").check();
    await page.getByRole("button", { name: "Добавить в корзину" }).click();
    await expect(page.getByRole("status")).toContainText("Букле, Песочный");
    await page.reload();

    const persistedItem = await page.evaluate(() => {
      const raw = window.localStorage.getItem("virtual-space:guest-cart:v1");
      if (!raw) return null;
      const value = JSON.parse(raw) as {
        state?: {
          items?: Array<{
            productId?: string;
            selectedOptions?: Array<{ groupId?: string; optionId?: string }>;
          }>;
        };
      };
      return value.state?.items?.[0] ?? null;
    });

    expect(persistedItem?.productId).toMatch(/^[1-9]\d*$/);
    expect(persistedItem?.selectedOptions).toContainEqual({ groupId: "color", optionId: "sand" });
  });
});
