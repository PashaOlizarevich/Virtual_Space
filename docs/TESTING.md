# Ручной запуск тестов Virtual Space

Все команды выполняются из корня проекта в Windows PowerShell.

## Требования

- Node.js 24 или новее.
- npm 11 или новее.
- Зависимости проекта установлены командой `npm install`.
- Chromium для Playwright установлен командой `npx playwright install chromium`.

Устанавливать зависимости и браузер повторно перед каждым запуском не нужно.

## Быстрая проверка проекта

```powershell
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
```

Команды проверяют ESLint, TypeScript, 60 unit/component/integration-тестов Jest и production-сборку.

## Запуск всех тестов

Чтобы последовательно запустить все тесты проекта, включая visual regression-тесты, выполните:

```powershell
npm test -- --runInBand
npm run test:e2e
npm run test:e2e:visual
```

## Основные E2E-тесты

```powershell
npm run test:e2e
```

Команда запускает критические пользовательские сценарии и автоматически:

1. поднимает Next.js dev-server на `http://127.0.0.1:3000`;
2. запускает Playwright Chromium;
3. исключает тесты с тегом `@visual`;
4. останавливает dev-server после завершения.

Не нужно отдельно выполнять `npm run dev`. Если dev-server уже запущен на этом адресе, Playwright
использует существующий процесс.

## Visual regression-тесты

```powershell
npm run test:e2e:visual
```

Набор проверяет геометрию header, мобильного поиска, корзины, checkout и hero-блоков About/Login.
Его рекомендуется запускать перед релизом и после изменений layout или глобальных стилей.

## Запуск одного E2E-файла

```powershell
npx playwright test tests/e2e/checkout.spec.ts
```

Другие примеры:

```powershell
npx playwright test tests/e2e/cart.spec.ts
npx playwright test tests/e2e/auth.spec.ts
npx playwright test tests/e2e/admin.spec.ts
```

## Запуск одного сценария

Используйте часть названия теста:

```powershell
npx playwright test tests/e2e/checkout.spec.ts --grep "recoverable connection error"
```

## Запуск в видимом браузере

```powershell
npx playwright test tests/e2e/checkout.spec.ts --headed
```

Для пошаговой диагностики:

```powershell
npx playwright test tests/e2e/checkout.spec.ts --debug
```

## Выбор адреса приложения

По умолчанию используется `http://127.0.0.1:3000`. Для проверки уже запущенного приложения на
другом адресе задайте переменную только для текущей PowerShell-сессии:

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

## HTML-отчёт Playwright

После завершённого запуска откройте последний отчёт:

```powershell
npx playwright show-report
```

При падении на повторной попытке Playwright сохраняет trace. Его можно открыть командой:

```powershell
npx playwright show-trace "путь-к-trace.zip"
```

Не добавляйте каталоги `playwright-report` и `test-results` в Git.

## Частые проблемы

### `ERR_CONNECTION_REFUSED`

Dev-server не запустился или был остановлен. Завершите прерванный процесс и снова выполните
`npm run test:e2e`. Не запускайте второй сервер на том же порту.

### `Blocked cross-origin request`

Проверьте, что используется актуальный `next.config.ts` с разрешённым dev-origin `127.0.0.1`, затем
полностью перезапустите dev-server.

### Процесс не завершается после тестов

Если все сценарии уже получили итоговый статус, остановите зависший процесс сочетанием `Ctrl+C`.
Не прерывайте запуск до появления итогов тестов: оставшиеся сценарии получат `ERR_CONNECTION_REFUSED`.

### Запуск завершился с ошибкой

Сначала изучите первую ошибку и `test-results/**/error-context.md`. Не изменяйте timeout и assertions,
пока не установлена причина в приложении, конфигурации или окружении.
