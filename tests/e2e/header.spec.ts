import { expect, test } from "@playwright/test";

test.describe("store header", () => {
  test("opens, closes and submits the header search", async ({ page }) => {
    await page.goto("/");
    const openSearch = page.getByRole("button", { name: "Открыть поиск" });
    const searchInput = page.getByRole("searchbox", { name: "Поиск товаров" });
    await openSearch.click();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();
    await searchInput.fill("кресло");
    await page.keyboard.press("Escape");
    await expect(searchInput).not.toBeVisible();
    await expect(openSearch).toBeFocused();
    await openSearch.click();
    await searchInput.fill("  кресло  ");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\/catalog\?search=%D0%BA%D1%80%D0%B5%D1%81%D0%BB%D0%BE$/);
  });

  test("opens the desktop catalog menu and restores focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Каталог", exact: true });
    await trigger.click();
    const catalog = page.getByRole("dialog", { name: "Категории" });
    await expect(catalog).toBeVisible();
    await expect(catalog.getByRole("link", { name: "Весь каталог" })).toHaveAttribute(
      "href",
      "/catalog",
    );
    await page.keyboard.press("Escape");
    await expect(catalog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test("opens mobile navigation and its category panel", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const navigation = page.getByRole("dialog", { name: "Навигация" });
    await expect(navigation).toBeVisible();
    await navigation.getByRole("button", { name: "Каталог" }).click();
    await expect(navigation).not.toBeVisible();
    const catalog = page.getByRole("dialog", { name: "Категории" });
    await expect(catalog.getByRole("link", { name: "Посуда" })).toBeVisible();
    await catalog.getByRole("button", { name: "Закрыть каталог" }).click();
    await expect(catalog).not.toBeVisible();
  });
});
