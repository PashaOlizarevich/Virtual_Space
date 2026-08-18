import { expect, test } from "@playwright/test";

test.describe("about page", () => {
  test("shows the store story and contact options", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/about");
    await expect(page).toHaveTitle(/О нас — Virtual Space/);
    await expect(page.getByRole("heading", { name: "Пространство для жизни" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Приходите знакомиться" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/virtualspace",
    );
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the hero heading inside its text column", async ({ page }) => {
    await page.setViewportSize({ width: 1223, height: 839 });
    await page.goto("/about");

    const heading = page.getByRole("heading", { name: "Пространство для жизни" });
    const contactHeading = page.getByRole("heading", { name: "Приходите знакомиться" });
    await expect(heading).toBeVisible();
    await expect
      .poll(() => heading.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
    await expect
      .poll(() => contactHeading.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
  });

  test("extends the desktop hero image beneath the header", async ({ page }) => {
    await page.setViewportSize({ width: 1223, height: 839 });
    await page.goto("/about");

    await expect
      .poll(async () => {
        const headerBox = await page.locator(".header").boundingBox();
        const mediaBox = await page.locator(".about-hero__media").boundingBox();
        const contentBox = await page.locator(".about-hero__content").boundingBox();
        if (!headerBox || !mediaBox || !contentBox) return false;
        return (
          Math.abs(mediaBox.y - headerBox.y) < 0.5 && Math.abs(contentBox.y - headerBox.y) < 0.5
        );
      })
      .toBe(true);
  });

  test("keeps the contact section readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await expect(page.getByText("Минск, посещение по предварительной записи")).toBeVisible();
    await expect(page.getByRole("link", { name: "Telegram" })).toBeVisible();
  });
});
