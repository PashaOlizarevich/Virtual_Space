import { expect, test } from "@playwright/test";

test.describe("store header", () => {
  test("shows desktop navigation and header actions", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");

    await expect(page).toHaveTitle(/Virtual Space/);
    await expect(page.locator(".header")).toHaveCSS("background-color", "rgba(16, 16, 16, 0.32)");
    await expect(page.locator(".header")).toHaveCSS(
      "border-bottom-color",
      "rgba(255, 255, 255, 0.18)",
    );
    const frostedFilter = await page.locator(".header").evaluate((element) => {
      const style = getComputedStyle(element) as CSSStyleDeclaration & {
        webkitBackdropFilter: string;
      };
      return style.backdropFilter || style.webkitBackdropFilter;
    });
    expect(frostedFilter).toBe("blur(18px) saturate(1.2)");
    await expect(page.locator(".header__logo")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.locator(".header__icon-link")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.locator(".header__icon-button").first()).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Virtual Space — на главную" })).toBeVisible();
    await expect(page.locator(".header__wordmark-letter")).toHaveCount(13);
    await expect(page.locator(".header__wordmark-letter").nth(1)).toHaveCSS(
      "animation-delay",
      "0.2s",
    );
    await expect(page.getByRole("button", { name: "Открыть поиск по сайту" })).toBeVisible();
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

  test("disables the decorative wordmark wave for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator(".header__wordmark-letter").first()).toHaveCSS(
      "animation-name",
      "none",
    );
  });
});
