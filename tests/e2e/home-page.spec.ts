import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("presents the complete store overview and scrolls to the showcase", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Пространство, в котором хочется остаться",
    );
    await expect(page.locator(".product-preview")).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Подробнее" })).toHaveCount(4);
    await expect(page.getByRole("button", { name: /Добавить .* в корзину/ })).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Подробнее" }).first()).toHaveAttribute(
      "href",
      "/product/forma-chair",
    );
    const actionOffsets = await page
      .locator(".product-preview__actions")
      .evaluateAll((actions) => actions.map((action) => action.getBoundingClientRect().top));
    expect(Math.max(...actionOffsets) - Math.min(...actionOffsets)).toBeLessThan(1);
    await expect(page.getByRole("heading", { name: "Почему Virtual Space" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Давайте создадим пространство вместе" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Смотреть коллекцию" }).click();
    await expect(page).toHaveURL(/#showcase$/);
    await expect(page.getByRole("heading", { name: "Избранное для вашего дома" })).toBeInViewport();
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the hero and showcase readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".product-preview")).toHaveCount(4);
    await expect(page.getByRole("button", { name: /Добавить .* в корзину/ }).first()).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });
});
