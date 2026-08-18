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
    await expect(page.locator(".header__logo")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.locator(".header__icon-link")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.locator(".header__icon-button").first()).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Каталог", exact: true })).toBeVisible();
    await expect(page.locator(".header__links > li > a")).toHaveText([
      "Магазины",
      "Новинки",
      "Акции",
      "О нас",
    ]);
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

  test("opens the desktop catalog mega menu and restores trigger focus", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "Каталог", exact: true });
    await trigger.click();
    const catalog = page.getByRole("dialog", { name: "Категории" });

    await expect(catalog).toBeVisible();
    await expect(catalog.locator(".catalog-menu__groups a")).toHaveText([
      "Диваны",
      "Кресла",
      "Пуфики",
      "Стулья",
      "Столы обеденные",
      "Столы для гостиной",
      "Кровати",
      "Матрасы",
      "Текстиль и декор",
      "Посуда",
    ]);
    await expect(catalog.getByRole("link", { name: "Весь каталог" })).toHaveAttribute(
      "href",
      "/catalog",
    );
    if (process.env.QA_SCREENSHOT_DIR) {
      await page.screenshot({ path: `${process.env.QA_SCREENSHOT_DIR}/catalog-desktop.png` });
    }

    await page.keyboard.press("Escape");
    await expect(catalog).not.toBeVisible();
    await expect(trigger).toBeFocused();
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
    await expect(dialog.getByRole("button", { name: "Каталог" })).toBeVisible();
    await expect(dialog.locator(".mobile-navigation__links > li")).toHaveText([
      "Каталог",
      "Магазины",
      "Новинки",
      "Акции",
      "О нас",
    ]);
    await expect(dialog.getByRole("link", { name: "Личный кабинет" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("opens the category panel from mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .getByRole("dialog", { name: "Навигация" })
      .getByRole("button", { name: "Каталог" })
      .click();

    await expect(page.getByRole("dialog", { name: "Навигация" })).not.toBeVisible();
    const catalog = page.getByRole("dialog", { name: "Категории" });
    await expect(catalog).toBeVisible();
    await expect(catalog.getByRole("link", { name: "Посуда" })).toBeVisible();
    if (process.env.QA_SCREENSHOT_DIR) {
      await page.screenshot({ path: `${process.env.QA_SCREENSHOT_DIR}/catalog-mobile.png` });
    }
    await catalog.getByRole("button", { name: "Закрыть каталог" }).click();
    await expect(catalog).not.toBeVisible();
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
