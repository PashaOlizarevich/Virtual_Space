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

  test("keeps the contact section readable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await expect(page.getByText("Минск, посещение по предварительной записи")).toBeVisible();
    await expect(page.getByRole("link", { name: "Telegram" })).toBeVisible();
  });
});
