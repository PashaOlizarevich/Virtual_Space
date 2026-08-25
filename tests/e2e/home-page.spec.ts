import { expect, test } from "@playwright/test";

test("reveals the product quick view for keyboard focus", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".product-preview").first();
  await card.getByRole("link", { name: "Подробнее" }).focus();
  await expect(card.locator(".product-preview__quick-view")).toBeVisible();
});
