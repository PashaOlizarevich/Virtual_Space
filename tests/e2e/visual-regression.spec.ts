import { expect, test } from "@playwright/test";

const desktopViewport = { width: 1280, height: 900 };
const mobileViewport = { width: 390, height: 844 };

test.describe("@visual layout contracts", () => {
  test("keeps the desktop header styling and navigation centered", async ({ page }) => {
    await page.setViewportSize(desktopViewport);
    await page.goto("/");

    const header = page.locator(".header");
    await expect(header).toHaveCSS("background-color", "rgba(16, 16, 16, 0.32)");
    await expect(header).toHaveCSS("border-bottom-color", "rgba(255, 255, 255, 0.18)");
    await expect(page.locator(".header__logo")).toHaveCSS("color", "rgb(255, 255, 255)");

    const centers = await page.locator(".header__links > li").evaluateAll((items) =>
      items.map((item) => {
        const bounds = item.getBoundingClientRect();
        return bounds.x + bounds.width / 2;
      }),
    );
    const intervals = centers.slice(1).map((center, index) => center - centers[index]);

    expect(Math.max(...intervals) - Math.min(...intervals)).toBeLessThanOrEqual(1);
    expect((centers[0] + centers.at(-1)!) / 2).toBeCloseTo(desktopViewport.width / 2, 0);
  });

  test("keeps mobile header controls from overlapping search", async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть поиск" }).click();

    const searchInput = page.getByRole("searchbox", { name: "Поиск товаров" });
    const menuButton = page.getByRole("button", { name: "Открыть меню" });
    const [searchBox, menuBox] = await Promise.all([
      searchInput.boundingBox(),
      menuButton.boundingBox(),
    ]);

    expect(searchBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    const controlsOverlap = !(
      searchBox!.x >= menuBox!.x + menuBox!.width ||
      menuBox!.x >= searchBox!.x + searchBox!.width ||
      searchBox!.y >= menuBox!.y + menuBox!.height ||
      menuBox!.y >= searchBox!.y + searchBox!.height
    );
    expect(controlsOverlap).toBe(false);
    expect(searchBox!.x + searchBox!.width).toBeLessThanOrEqual(mobileViewport.width);
  });

  test("keeps the mobile cart panel within the viewport", async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .getByRole("dialog", { name: "Навигация" })
      .getByRole("button", { name: "Корзина" })
      .click();

    const panelBox = await page.locator(".cart-widget__panel").boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.x).toBeGreaterThanOrEqual(-1);
    expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(mobileViewport.width + 1);
    expect(panelBox!.height).toBeLessThanOrEqual(mobileViewport.height);
  });

  test("keeps the mobile checkout form and action inside the viewport", async ({ page }) => {
    await page.setViewportSize(mobileViewport);
    await page.goto("/checkout");

    const button = page.getByRole("button", { name: "Оформить заявку" });
    const buttonBox = await button.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.x).toBeGreaterThanOrEqual(0);
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(mobileViewport.width);
    await expect(page.getByLabel("Имя *")).toBeVisible();
  });

  test("aligns the about hero with the translucent header", async ({ page }) => {
    await page.setViewportSize({ width: 1223, height: 839 });
    await page.goto("/about");

    const heading = page.getByRole("heading", { name: "Пространство для жизни" });
    const contactHeading = page.getByRole("heading", { name: "Приходите знакомиться" });
    await expect
      .poll(() => heading.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
    await expect
      .poll(() => contactHeading.evaluate((element) => element.scrollWidth <= element.clientWidth))
      .toBe(true);
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

  test("extends the login image beneath the translucent header", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/login");

    await expect
      .poll(async () => {
        const headerBox = await page.locator(".header").boundingBox();
        const mediaBox = await page.locator(".auth-page__media").boundingBox();
        if (!headerBox || !mediaBox) return false;
        return Math.abs(headerBox.y - mediaBox.y) < 0.5;
      })
      .toBe(true);
    await expect
      .poll(async () => (await page.locator(".auth-page__media").boundingBox())?.height ?? 0)
      .toBeGreaterThanOrEqual(1000);
  });
});
