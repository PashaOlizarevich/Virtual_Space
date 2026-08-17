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

## Task 9 — Действия карточки товара

- Результат: карточка товара на главной дополнена отдельной зоной действий с вторичной ссылкой «Подробнее» на типизированный маршрут `/product/[slug]` и основной кнопкой «Добавить в корзину»; для кнопки добавления сформировано предметное доступное имя, а описание сохранено в пределах двух строк.
- Файлы: `src/modules/catalog/components/product-preview.tsx`, `src/styles/globals.css`, `src/app/(store)/page.test.tsx`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; изолированный `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3101 npm run test:e2e` на production-сервере — 5 Chromium-сценариев успешно; desktop 1440×900 и mobile 390×844 визуально проверены через Playwright.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: карточка остаётся Server Component; клиентская граница и хранилище корзины не добавлялись до отдельного этапа Zustand/persist.
- Ограничения: маршрут `/product/[slug]` и сохранение товара в корзину относятся к следующим пунктам плана, поэтому ссылка уже формирует будущий URL, а кнопка пока представляет доступный UI-control без изменения состояния; Browser plugin недоступен, rendered QA выполнен через проектный Playwright.

## Task 10 — Выравнивание действий карточек товара

- Результат: исправлено вертикальное смещение действий карточки стола Linea; карточки в одной desktop-строке теперь растягивают контент до общей высоты, поэтому разделители и обе кнопки выровнены независимо от длины описания.
- Файлы: `src/styles/globals.css`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; изолированный `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3127 npm run test:e2e` — 5 Chromium-сценариев успешно, включая regression-проверку равных координат action-зон; desktop 1440×900 визуально проверен через Playwright.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, rendered QA выполнен через проектный Playwright.

## Task 11 — Затемнённая glass-поверхность Header

- Результат: поверхность Header приведена к референсу через тёмный полупрозрачный фон с непрозрачностью `58%`, усиленный blur/saturation и тонкую светлую границу; wordmark, навигация, иконки и доступный focus получили светлый контраст без изменений геометрии, анимации и поведения mobile drawer.
- Файлы: `src/styles/globals.css`, `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3142 npm run test:e2e` — 5 Chromium-сценариев успешно; desktop 1440×900 и mobile 390×844 визуально проверены через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` — необязательный адрес изолированного E2E-сервера.
- Архитектура: без изменений; Header остаётся Server Component, правка ограничена CSS и regression-проверками поверхности.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен через проектный Playwright; commit и push не выполнялись.

## Task 12 — Общий фон Header и Hero

- Результат: Hero главной страницы поднят под Header на его высоту `80px`; изображение `hero-v2.png` теперь непрерывно заполняет первый экран, включая область под полупрозрачной glass-поверхностью Header, а контент Hero сохранил прежнее безопасное смещение.
- Файлы: `src/styles/globals.css`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3143 npm run test:e2e -- tests/e2e/home-page.spec.ts` — 2 сценария успешно; rendered desktop-представление проверено через Chrome DevTools и `view_image`.
- Архитектура и зависимости: без изменений.
- Ограничения: commit и push не выполнялись.

## Task 13 — Иконка поиска в Header

- Результат: в группе действий Header перед ссылкой на личный кабинет добавлена доступная кнопка с иконкой поиска и именем «Открыть поиск по сайту»; кнопка использует существующий `Button` и визуальные правила шапки, а логика поиска оставлена для следующего этапа.
- Файлы: `src/components/layout/header.tsx`, `src/components/layout/header.test.tsx`, `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 5 тестов успешно; `npm run build` — успешно; `npm run test:e2e -- tests/e2e/header.spec.ts` — не завершён успешно: изолированный сервер не стартовал из-за уже запущенного `next dev`, а существующий сервер показал два не связанных с кнопкой расхождения прежних ожиданий Header (`background-color` и mobile dialog), 1 из 3 сценариев прошёл.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для попыток изолированного E2E-запуска.
- Архитектура: без изменений; Header остаётся Server Component, клиентская логика поиска не добавлялась.
- Ограничения: поиск пока не открывает интерфейс и не выполняет запросы; Browser plugin недоступен, rendered QA ограничен Playwright; commit и push не выполнялись.

## Task 14 — Каталог и страница товара

- Результат: добавлены второстепенная страница `/catalog` и статически генерируемые страницы `/product/[id]` для четырёх товаров; типизированный слой моков расширен галереей, характеристиками и группами вариантов; выбор конфигурации и добавление в локальный прототип корзины подтверждаются доступным live-status.
- Файлы: `src/app/(store)/catalog/page.tsx`, `src/app/(store)/product/[id]/page.tsx`, `src/modules/catalog/types.ts`, `src/modules/catalog/mock-data.ts`, `src/modules/catalog/components/product-gallery.tsx`, `src/modules/catalog/components/product-configurator.tsx`, `src/styles/globals.css`, `src/app/(store)/catalog/catalog.test.tsx`, `tests/e2e/catalog.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 7 тестов успешно; `npm run build` — успешно, каталог статический, 4 страницы товаров SSG; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3150 npm run test:e2e -- tests/e2e/catalog.spec.ts` — 2 Chromium-сценария успешно; desktop 1440×900 и mobile 390×844 визуально проверены через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: существующие границы `app -> modules -> components/shared` сохранены; страницы читают отдельный типизированный mock-слой, интерактивность изолирована в минимальном Client Component.
- Ограничения: глобальное Zustand/persist-хранилище и cart drawer относятся к пунктам 8–9 плана; текущий прототип корзины подтверждает выбранную конфигурацию локально и не сохраняет её между маршрутами. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; commit и push не выполнялись.

## Task 15 — Быстрый просмотр товара

- Результат: карточки товаров на главной и в каталоге показывают рядом компактное окно с названием, ценой, описанием и кнопкой перехода после одной секунды непрерывного наведения; для клавиатуры окно открывается сразу при фокусе внутри карточки, а на touch/mobile не выводится.
- Файлы: `src/modules/catalog/components/product-preview.tsx`, `src/styles/globals.css`, `src/app/(store)/page.test.tsx`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 7 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3152 npm run test:e2e -- tests/e2e/home-page.spec.ts tests/e2e/catalog.spec.ts` — 6 Chromium-сценариев успешно; hover-состояние при 1440×900 визуально проверено через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: без изменений; карточка остаётся Server Component, задержка и доступное focus-состояние реализованы CSS без клиентского JavaScript.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; commit и push не выполнялись.

## Task 16 — Размеры в быстром просмотре

- Результат: мини-окно быстрого просмотра дополнено отдельной строкой размеров товара; значение берётся из существующей типизированной характеристики «Размер» без дублирования мок-данных.
- Файлы: `src/modules/catalog/components/product-preview.tsx`, `src/styles/globals.css`, `src/app/(store)/page.test.tsx`, `tests/e2e/home-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 7 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3155 npm run test:e2e -- tests/e2e/home-page.spec.ts` — 4 основных Chromium-сценария успешно; hover-состояние с размерами при 1440×900 визуально проверено через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; commit и push не выполнялись.

## Task 17 — Синхронизация E2E-проверки Header

- Результат: E2E-ожидание прозрачности Header синхронизировано с фактическим утверждённым CSS-значением `32%`; полный пользовательский набор снова проходит.
- Файлы: `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3157 npm run test:e2e` — 9 Chromium-сценариев успешно; ранее в том же финальном цикле успешно выполнены `npm run lint`, `npm run typecheck`, `npm test -- --runInBand` и `npm run build`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: без изменений.
- Ограничения: нет.

## Task 18 — Страница о магазине

- Результат: создана адаптивная публичная страница `/about` с историей и подходом Virtual Space,
  интерьерным изображением, актуальными мок-контактами шоурума и типизированным списком социальных
  сетей; добавлены metadata и доступная семантическая разметка.
- Файлы: `src/app/(store)/about`, `src/modules/settings/types.ts`,
  `src/modules/settings/mock-data.ts`, `src/styles/globals.css`, `tests/e2e/about-page.spec.ts`,
  `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 8 тестов успешно; `npm run build` —
  успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3165 npm run test:e2e -- tests/e2e/about-page.spec.ts` —
  2 Chromium-сценария успешно; desktop 1440×1100 и mobile 390×844 визуально сверены с концептом.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: существующая граница `app -> modules/settings` сохранена; страница остаётся Server
  Component, backend и база данных не подключались.
- Ограничения: контакты и ссылки социальных сетей остаются типизированными мок-данными до этапа
  серверных настроек; Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.
