import { expect, test } from "@playwright/test";

test.describe("catalog and product", () => {
  test("opens the sofas category with five products", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("button", { name: "Каталог", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Категории" })
      .getByRole("link", { name: "Диваны" })
      .click();

    await expect(page).toHaveURL(/\/catalog\/sofas$/);
    await expect(page).toHaveTitle(/Диваны/);
    await expect(page.getByRole("heading", { name: "Диваны", level: 1 })).toBeVisible();
    await expect(page.locator(".sofas-page .product-preview")).toHaveCount(5);
    for (const productName of [
      "Диван Modul",
      "Диван Lento",
      "Диван Vela",
      "Диван Nord",
      "Диван Aura",
    ]) {
      await expect(page.getByRole("heading", { name: productName, level: 3 })).toBeVisible();
    }

    if (process.env.QA_SCREENSHOT_DIR) {
      const sofaImages = page.locator(".sofas-page .product-preview__media img");
      await expect
        .poll(() =>
          sofaImages.evaluateAll((images: HTMLImageElement[]) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
        )
        .toBe(true);
      await page.screenshot({
        path: `${process.env.QA_SCREENSHOT_DIR}/sofas-desktop.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: `${process.env.QA_SCREENSHOT_DIR}/sofas-mobile.png`,
        fullPage: true,
      });
    }

    await page.getByRole("link", { name: "Подробнее" }).first().click();
    await expect(page).toHaveURL(/\/product\/modul-sofa$/);
    await expect(page.getByRole("heading", { name: "Диван Modul", level: 1 })).toBeVisible();
  });

  test("opens the chairs category with three products", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("button", { name: "Каталог", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Категории" })
      .getByRole("link", { name: "Стулья" })
      .click();

    await expect(page).toHaveURL(/\/catalog\/chairs$/);
    await expect(page).toHaveTitle(/Стулья/);
    await expect(page.getByRole("heading", { name: "Стулья", level: 1 })).toBeVisible();
    await expect(page.locator(".chairs-page .product-preview")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "Стул Arco", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Стул Noma", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Стул Tera", level: 3 })).toBeVisible();

    if (process.env.QA_SCREENSHOT_DIR) {
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `${process.env.QA_SCREENSHOT_DIR}/chairs-desktop.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      const chairImages = page.locator(".chairs-page .product-preview__media img");
      for (let index = 0; index < (await chairImages.count()); index += 1) {
        const image = chairImages.nth(index);
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element: HTMLImageElement) => element.decode());
      }
      await expect
        .poll(() =>
          chairImages.evaluateAll((images: HTMLImageElement[]) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
        )
        .toBe(true);
      await page.evaluate(() => {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, 0);
      });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({
        path: `${process.env.QA_SCREENSHOT_DIR}/chairs-mobile.png`,
        fullPage: true,
      });
    }

    await page.getByRole("button", { name: "Добавить «Стул Noma» в корзину" }).click();
    await page.getByRole("link", { name: "Подробнее" }).nth(1).click();
    await expect(page).toHaveURL(/\/product\/noma-chair$/);
    await expect(page.getByRole("heading", { name: "Стул Noma", level: 1 })).toBeVisible();
  });

  test("opens the tableware category from the catalog menu", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("button", { name: "Каталог", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Категории" })
      .getByRole("link", { name: "Посуда" })
      .click();

    await expect(page).toHaveURL(/\/catalog\/tableware$/);
    await expect(page).toHaveTitle(/Посуда/);
    await expect(page.getByRole("heading", { name: "Посуда", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Набор тарелок Lumo", level: 3 })).toBeVisible();
    await expect(page.locator(".tableware-page .product-preview")).toHaveCount(1);
    const productImage = page.locator(".tableware-page .product-preview__media img");
    await expect(productImage).toHaveCSS("object-fit", "cover");
    await expect(productImage).toHaveAttribute("sizes", "(max-width: 899px) 100vw, 60vw");
    await expect
      .poll(() => productImage.evaluate((image: HTMLImageElement) => image.currentSrc))
      .toContain("q=100");
  });

  test("loads and refreshes the cached catalog", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.getByText("В коллекции: 4")).toBeVisible();
    await page.getByRole("button", { name: "Обновить" }).click();
    await expect(page.getByText("Обновляем коллекцию…")).toBeVisible();
    await expect(page.getByText("В коллекции: 4")).toBeVisible();
    await expect(page.locator(".product-preview")).toHaveCount(4);
  });

  test("opens a product and adds the selected configuration", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/catalog");
    await expect(page).toHaveTitle(/Каталог/);
    await expect(page.getByRole("heading", { name: "Мебель для спокойного дома" })).toBeVisible();
    await page.getByRole("link", { name: "Подробнее" }).first().click();

    await expect(page).toHaveURL(/\/product\/forma-armchair$/);
    await expect(page.getByRole("heading", { name: "Кресло Forma" })).toBeVisible();
    await page.getByLabel("Песочный").check();
    await page.getByRole("button", { name: "Добавить в корзину" }).click();
    await expect(page.getByRole("status")).toContainText("Букле, Песочный");
    await page.reload();
    const persistedCart = await page.evaluate(() =>
      window.localStorage.getItem("virtual-space:guest-cart:v1"),
    );
    expect(persistedCart).toContain('"productId":"forma-armchair"');
    expect(persistedCart).toContain('"optionId":"sand"');
    expect(consoleErrors).toEqual([]);
  });

  test("keeps the product page usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/product/modul-sofa");
    await expect(page.getByRole("heading", { name: "Диван Modul" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить в корзину" })).toBeVisible();
  });
});
