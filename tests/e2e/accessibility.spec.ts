import { expect, test } from "@playwright/test";

test.describe("accessibility and responsive foundations", () => {
  test("supports skip navigation and keyboard-operated mobile dialog", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Перейти к основному содержимому" });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const menuButton = page.getByRole("button", { name: "Открыть меню" });
    await menuButton.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Навигация" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Закрыть меню" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(menuButton).toBeFocused();
  });

  test("removes route motion when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/catalog");

    await expect(page.locator("#main-content")).toHaveCSS("transform", "none");
    await expect(page.locator("#main-content")).toHaveCSS("opacity", "1");
  });

  for (const route of ["/", "/catalog", "/about", "/login"] as const) {
    test(`${route} has no horizontal overflow on a narrow viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(route);

      const overflow = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        return [...document.querySelectorAll<HTMLElement>("body *")]
          .filter((element) => {
            const bounds = element.getBoundingClientRect();
            return bounds.right > viewportWidth + 1 || bounds.left < -1;
          })
          .map((element) => ({
            className: element.className,
            tagName: element.tagName,
          }));
      });

      expect(overflow).toEqual([]);
    });
  }
});
