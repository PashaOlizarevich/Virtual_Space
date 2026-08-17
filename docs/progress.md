# Прогресс проекта

Этот файл — краткая долговременная память о завершённых изменениях Virtual Space. Перед feature,
refactor или bugfix агент читает записи, связанные с задачей. После завершённого существенного
изменения агент добавляет одну запись согласно `.codex/rules/completion.md`.

## Правила ведения

- Использовать последовательные номера `Task 1`, `Task 2` и далее без дат.
- Записывать только фактически завершённый и проверенный результат.
- Указывать имена новых переменных окружения, но никогда не их значения.
- Не сохранять секреты, персональные данные, полные логи и внутренние рассуждения.
- Известные ограничения и пропущенные проверки указывать явно.
- Старые записи не переписывать; исправления и отмены фиксировать новой записью.

## Записи

## Task 1 — Жизненный цикл завершения и память проекта

- Результат: добавлены обязательный протокол завершения задач, чтение памяти перед разработкой и
  последовательный журнал завершённых существенных изменений.
- Файлы: `AGENTS.md`, `.codex/rules/completion.md`, `docs/progress.md`.
- Проверки: наличие связанных файлов и маршрутов — успешно; `git diff --check` — успешно; поиск
  TODO и секретоподобных значений — совпадений нет.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Ограничения: тесты приложения не запускались, поскольку исходный код и runtime-конфигурация не
  изменялись.

## Task 2 — Git Workflow для задач разработки

- Результат: добавлены обязательная изоляция задач в ветках/worktree, правила атомарных savepoint-коммитов и запрет на merge, push, PR и удаление worktree без прямого разрешения пользователя.
- Файлы: `AGENTS.md`, `.codex/rules/git.md`, `.codex/rules/completion.md`, `docs/git-flow.md`, `docs/progress.md`.
- Проверки: проверка ссылок на файлы правил, `git diff --check`, просмотр итогового diff.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Ограничения: workflow управляет действиями Codex, но защита веток на GitHub настраивается отдельно в репозитории.

## Task 3 — Базовый frontend-фундамент

- Результат: создана основа Next.js App Router с публичной route group, глобальными дизайн-токенами,
  адаптивной 12-колоночной сеткой, типографикой, layout-компонентами, UI-кнопкой и доступными
  состояниями loading, empty, error и not-found.
- Файлы: `src/app`, `src/components/layout`, `src/components/ui`, `src/shared/utils.ts`,
  `src/styles/globals.css`, `tsconfig.json`.
- Проверки: `npm run lint` — успешно с одним существующим предупреждением в
  `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 2 теста
  успешно; `npm run build` — успешно; desktop и mobile визуальная проверка Playwright — успешно.
- Переменные окружения: нет.
- Архитектура: реализована ранее утверждённая структура `app -> components/ui|shared`, без
  изменения архитектурных границ.
- Ограничения: `npm ci` распаковал зависимости, но завершился ошибкой существующего `postinstall`,
  потому что Prisma schema относится к будущему этапу и пока отсутствует.

## Task 4 — Общий Header магазина

- Результат: реализован адаптивный Header с центрированным логотипом Virtual Space, основной навигацией,
  кнопкой корзины и переходом в личный кабинет; на мобильных экранах навигация открывается в modal drawer
  и закрывается по явной кнопке, overlay и `Esc`.
- Файлы: `src/app/(store)/layout.tsx`, `src/components/layout/header.tsx`,
  `src/components/layout/mobile-navigation.tsx`, `src/components/layout/header.test.tsx`,
  `src/styles/globals.css`, `tests/e2e/header.spec.ts`, `jest.config.ts`, `playwright.config.ts`,
  `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 3 теста успешно; `npm run build` — успешно;
  `npm run test:e2e` — 2 Chromium-сценария успешно; визуальная проверка desktop 1440×900 и mobile 390×844 — успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес уже запущенного приложения для E2E.
- Архитектура: Header остаётся Server Component, клиентская граница ограничена интерактивной мобильной навигацией.
- Ограничения: кнопка корзины открывает cart widget на следующем предусмотренном этапе; Browser plugin недоступен,
  поэтому rendered QA выполнен через проектный Playwright.

## Task 5 — Волна в wordmark Header

- Результат: заголовок `VIRTUAL SPACE` в Header разбит на буквы с последовательной бесконечной CSS-волной исчезновения и
  появления; сохранено цельное доступное имя, а при `prefers-reduced-motion` декоративная анимация отключается.
- Файлы: `src/components/layout/header.tsx`, `src/components/layout/header.test.tsx`, `src/styles/globals.css`,
  `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно;
  `npm test -- --runInBand` — 4 теста успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e` —
  3 Chromium-сценария успешно, включая desktop, mobile, console health и reduced motion.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: Header остаётся Server Component; анимация реализована CSS без новой client-границы.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен через проектный Playwright; отдельные screenshots не сохранялись.

## Task 6 — Замедление волны wordmark Header

- Результат: скорость последовательной волны `VIRTUAL SPACE` уменьшена в два раза: полный цикл увеличен с `2.4s` до `4.8s`,
  а шаг между буквами — с `0.1s` до `0.2s`; ритм и порядок анимации сохранены.
- Файлы: `src/components/layout/header.tsx`, `src/components/layout/header.test.tsx`, `src/styles/globals.css`,
  `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, `npm run build` и `npm run test:e2e`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес уже запущенного приложения для E2E.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполняется через проектный Playwright.

## Task 7 — Главная страница магазина

- Результат: реализована адаптивная главная страница с информационным hero-блоком, витриной из четырёх товаров, преимуществами и контактами; данные товаров и магазина вынесены в отдельные типизированные mock-слои, а согласованные изображения подключены через `next/image`.
- Файлы: `src/app/(store)/page.tsx`, `src/modules/catalog`, `src/modules/settings`, `src/styles/globals.css`, `public/images/home`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; изолированный `npm run test:e2e` на порту 3100 — 5 Chromium-сценариев успешно; desktop 1440×900 и mobile 390×844 визуально сверены с созданным концептом.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: существующие границы `app -> modules -> components/shared` сохранены; backend и база данных не подключались.
- Ограничения: действия карточки товара и корзина относятся к следующим пунктам плана и не реализованы; Browser plugin недоступен, поэтому rendered QA выполнен через проектный Playwright.

## Task 8 — Читаемый интерьерный hero главной

- Результат: hero главной получил новое высокодетализированное интерьерное изображение, повторяющее композицию утверждённого концепта; свободная светлая зона слева и уточнённые desktop-ограничения текста обеспечивают стабильную читаемость без подложки, мобильная контрастная карточка сохранена.
- Файлы: `next.config.ts`, `src/app/(store)/page.tsx`, `src/styles/globals.css`, `public/images/home/hero-v2.png`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e` — 5 Chromium-сценариев успешно; desktop 1440×900 и mobile 390×844 визуально сверены с утверждённым концептом через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: без изменений; hero остаётся Server Component и использует локальный asset через `next/image` с разрешённым качеством 100.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен через проектный Playwright; исходный `hero.png` сохранён для безопасного отката и не используется страницей.
