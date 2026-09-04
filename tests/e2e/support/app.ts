import { expect, type Page, type TestInfo } from "@playwright/test";

const FORMA_PRODUCT_PATH = "/product/forma-armchair";

type Credentials = Readonly<{ email: string; password: string }>;

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required E2E environment variable: ${name}`);
  return value;
}

function retryEmail(email: string, retry: number): string {
  const separator = email.lastIndexOf("@");
  if (separator < 1) throw new Error("E2E fixture email must contain a local part and domain.");
  return `${email.slice(0, separator)}+retry-${retry}${email.slice(separator)}`.toLowerCase();
}

export function adminCredentials(testInfo: TestInfo): Credentials {
  return {
    email: retryEmail(requiredEnvironmentVariable("E2E_ADMIN_EMAIL"), testInfo.retry),
    password: requiredEnvironmentVariable("E2E_ADMIN_PASSWORD"),
  };
}

export function userCredentials(testInfo: TestInfo): Credentials {
  return {
    email: retryEmail(requiredEnvironmentVariable("E2E_USER_EMAIL"), testInfo.retry),
    password: requiredEnvironmentVariable("E2E_USER_PASSWORD"),
  };
}

export async function loginAsAdmin(page: Page, testInfo: TestInfo): Promise<void> {
  const credentials = adminCredentials(testInfo);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin$/);
  await expect(page.getByRole("heading", { name: "Войти в аккаунт" })).toBeVisible();
  const loginPanel = page.getByRole("tabpanel");
  await loginPanel.getByLabel("Email").fill(credentials.email);
  await loginPanel.getByLabel("Пароль", { exact: true }).fill(credentials.password);
  await loginPanel.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
}

export async function loginAsUser(page: Page, testInfo: TestInfo): Promise<void> {
  const credentials = userCredentials(testInfo);
  await page.goto("/login");
  const loginPanel = page.getByRole("tabpanel");
  await loginPanel.getByLabel("Email").fill(credentials.email);
  await loginPanel.getByLabel("Пароль", { exact: true }).fill(credentials.password);
  await loginPanel.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Вход выполнен" })).toBeVisible();
}

export async function addFormaToCart(page: Page, color = "Молочный"): Promise<void> {
  await page.goto(FORMA_PRODUCT_PATH);
  const colorOptions = page.getByRole("group", { name: "Цвет", exact: true });
  await colorOptions.getByRole("radio", { name: color, exact: true }).check();
  await page.getByRole("button", { name: "Добавить в корзину" }).click();
  await expect(page.getByRole("status")).toContainText(`Букле, ${color}`);
}

export async function openFormaFromCatalog(page: Page): Promise<void> {
  await page.goto("/catalog");
  await expect(page.locator(".catalog-query__viewport .product-preview").first()).toBeVisible();

  const productCard = page
    .locator("article.product-preview")
    .filter({ has: page.getByRole("heading", { name: "Кресло Forma", exact: true }) });
  const productLink = productCard.getByRole("link", { name: "Подробнее", exact: true });
  const pagination = page.getByRole("navigation", { name: "Страницы каталога" });

  for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
    if (await productLink.isVisible()) {
      await productLink.click();
      await expect(page).toHaveURL(new RegExp(`${FORMA_PRODUCT_PATH}$`));
      return;
    }

    const nextPage = pagination.getByRole("button", { name: "Следующая страница каталога" });
    if ((await nextPage.count()) === 0 || (await nextPage.isDisabled())) break;
    await nextPage.click();
    await expect(
      pagination.getByText(new RegExp(`^Страница ${pageIndex + 2} из \\d+$`)),
    ).toBeVisible();
  }

  throw new Error("The Forma product link was not found in the catalog pagination.");
}
