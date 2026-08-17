import { expect, test } from "@playwright/test";

test.describe("store header", () => {
  test("shows desktop navigation and header actions", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/Virtual Space/);
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Virtual Space — на главную" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Личный кабинет" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Открыть корзину" })).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("opens and closes mobile navigation", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Открыть меню" }).click();
    const dialog = page.getByRole("dialog", { name: "Навигация" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Каталог" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Личный кабинет" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
