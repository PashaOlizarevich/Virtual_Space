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

## Task 19 — Переполнение заголовков страницы о магазине

- Результат: уменьшена адаптивная шкала заголовка hero на `/about`, а контактному заголовку выделена
  более широкая desktop-колонка; оба текста больше не заходят на изображение или соседний контент на
  ширине 1223 px, мобильная композиция сохранена.
- Файлы: `src/styles/globals.css`, `tests/e2e/about-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 8 тестов успешно; `npm run build` —
  успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3167 npm run test:e2e -- tests/e2e/about-page.spec.ts` —
  3 Chromium-сценария успешно, включая regression-проверку переполнения; viewport 1223×839 и
  mobile 390×844 визуально проверены.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 20 — Изображение About под Header

- Результат: desktop-изображение hero на `/about` поднято под полупрозрачную поверхность Header на
  полную высоту `80px`; компенсационный отступ перенесён в текстовую колонку, поэтому заголовок и
  описание остаются в безопасной области, а мобильная последовательность блоков не изменилась.
- Файлы: `src/styles/globals.css`, `tests/e2e/about-page.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 8 тестов успешно; `npm run build` —
  успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3168 npm run test:e2e -- tests/e2e/about-page.spec.ts` —
  4 Chromium-сценария успешно; desktop 1223×839 и mobile 390×844 визуально проверены.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 21 — Клиентский кеш каталога

- Результат: подключён общий TanStack Query Provider; каталог переведён на типизированный асинхронный query-слой с кешированием, ручным фоновым обновлением и доступными состояниями loading, empty и error. До появления backend-контракта query-функция использует существующие типизированные мок-данные.
- Файлы: `src/app/providers.tsx`, `src/app/layout.tsx`, `src/app/(store)/catalog/page.tsx`, `src/modules/catalog/queries.ts`, `src/modules/catalog/components/catalog-query-grid.tsx`, `src/styles/globals.css`, `src/app/(store)/catalog/catalog.test.tsx`, `tests/e2e/catalog.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 10 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3172 npm run test:e2e -- tests/e2e/catalog.spec.ts` — 3 Chromium-сценария успешно; desktop-вид каталога визуально проверен снимком Playwright.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: реализована уже описанная в `docs/architecture.md` граница `app -> modules/catalog` и общий `app/providers.tsx`; реальный HTTP transport остаётся этапом backend.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; данные каталога остаются моковыми до реализации backend-контракта.

## Task 22 — Persist-хранилище гостевой корзины

- Результат: реализовано Zustand-хранилище гостевой корзины с версионированным persist-сохранением в `localStorage`; одинаковые конфигурации объединяются, количество и размер корзины ограничены, вход и восстановленное состояние валидируются Zod. Кнопки каталога и конфигуратора добавляют товар с выбранными option-id и наблюдаемой ценой.
- Файлы: `src/modules/cart/types.ts`, `src/modules/cart/schemas.ts`, `src/modules/cart/store.ts`, `src/modules/cart/store.test.ts`, `src/modules/catalog/components/product-preview.tsx`, `src/modules/catalog/components/product-configurator.tsx`, `tests/e2e/catalog.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 14 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3174 npm run test:e2e -- tests/e2e/catalog.spec.ts` — 3 Chromium-сценария успешно; desktop-страница товара визуально проверена снимком Playwright; security review применимой границы localStorage — подтверждённых findings нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: реализован уже описанный поток `Product DTO -> Zustand -> persist/localStorage`; в persisted state находятся только идентификаторы, количество, выбранные option-id и наблюдаемая цена.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; серверная сверка цены и доступности относится к последующим backend-пунктам.

## Task 23 — Виджет гостевой корзины

- Результат: кнопка корзины в Header открывает доступный modal drawer со счётчиком товаров, изображениями, названиями, выбранными вариантами, предварительной стоимостью, quantity stepper, удалением позиций, итогом и CTA `Оформить заявку`; добавлены пустое состояние и вход в тот же drawer из мобильного меню. Native dialog удерживает focus, закрывается по кнопке, overlay и `Esc`, возвращает focus trigger’у и блокирует прокрутку фоновой страницы.
- Файлы: `src/modules/cart/components/cart-widget.tsx`, `src/modules/cart/store.ts`, `src/modules/cart/store.test.ts`, `src/components/layout/header.tsx`, `src/components/layout/mobile-navigation.tsx`, `src/styles/globals.css`, `tests/e2e/cart.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 16 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npm run test:e2e -- tests/e2e/cart.spec.ts` — 3 Chromium-сценария успешно. Desktop 1440×1000 и mobile 390×844 визуально сверены снимками Playwright.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для изолированного E2E-сервера.
- Архитектура: сохранена граница `app/components -> modules/cart`; каталог остаётся типизированным источником отображаемых мок-данных, а недоверенное persisted-состояние продолжает проходить Zod-валидацию. Security review клиентской границы не выявил подтверждённых findings; клиентская цена и итог не считаются доверенными.
- Ограничения: CTA резервирует маршрут `/checkout`, содержимое которого будет реализовано в пункте формы оформления; серверная сверка доступности и цены, unavailable/changed-price состояния и подтверждение новой цены относятся к следующему пункту плана. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 24 — Проверка актуальности гостевой корзины

- Результат: сохранённые позиции сверяются с текущим типизированным mock-каталогом; удалённый товар или устаревшая конфигурация явно помечаются недоступными и исключаются из количества, суммы и оформления. Изменившаяся цена показывается вместе с прежней стоимостью, учитывается в актуальном итоге и требует явного подтверждения перед переходом к checkout.
- Файлы: `src/modules/cart/validation.ts`, `src/modules/cart/validation.test.ts`, `src/modules/cart/store.ts`, `src/modules/cart/store.test.ts`, `src/modules/cart/components/cart-widget.tsx`, `src/styles/globals.css`, `tests/e2e/cart.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 20 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npm run test:e2e -- tests/e2e/cart.spec.ts` — 4 Chromium-сценария успешно; desktop 1440×1000 визуально проверен снимком Playwright, console errors отсутствуют. Security review недоверенной localStorage-границы — подтверждённых findings нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для подключения к существующему локальному E2E-серверу.
- Архитектура: добавлен чистый клиентский слой `CartItem + текущий Product mock -> validated cart item`; persisted-данные по-прежнему проходят Zod-валидацию, а клиентские цена и итог остаются недоверенными и подлежат финальной серверной проверке при создании заявки.
- Ограничения: реальная серверная сверка существования, доступности, вариантов и цены будет подключена в backend-пунктах 24 и 30; текущая frontend-итерация использует mock-каталог как источник актуальности. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 25 — Форма оформления заявки

- Результат: создан статический маршрут `/checkout` с адаптивной формой имени, телефона, email и необязательного комментария. React Hook Form использует общую Zod-схему, показывает связанные с полями ошибки, summary после неуспешного submit и переводит фокус на первое неверное поле; добавлены переиспользуемые form-примитивы `Field`, `Input` и `Textarea`.
- Файлы: `src/app/(store)/checkout/page.tsx`, `src/modules/checkout/schemas.ts`, `src/modules/checkout/schemas.test.ts`, `src/modules/checkout/components/checkout-form.tsx`, `src/components/ui/field.tsx`, `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`, `src/styles/globals.css`, `tests/e2e/checkout.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 23 теста успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npm run test:e2e -- tests/e2e/checkout.spec.ts` — 3 Chromium-сценария успешно. Desktop 1440×1000 и mobile 390×844 визуально проверены снимками Playwright, console errors отсутствуют. Security review клиентского ввода — подтверждённых findings нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для подключения к существующему локальному E2E-серверу.
- Архитектура: страница остаётся Server Component, интерактивная форма изолирована Client Component-островом; общий контракт `checkoutFormSchema` размещён в checkout-модуле для последующего повторного использования серверной границей.
- Ограничения: отправка, pending/error/success-состояния и создание заказа относятся к пункту 12 и намеренно не реализованы. Клиентская валидация не заменяет будущую обязательную серверную проверку. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 26 — Состояния отправки заявки

- Результат: checkout-форма получила блокируемое pending-состояние, доступные сообщения ожидаемых
  ошибок без потери введённых данных и экран подтверждения с номером заказа; после подтверждённого
  успеха гостевая корзина очищается. Типизированный временный transport повторно валидирует форму и
  корзину и отклоняет недоступные позиции или неподтверждённую цену.
- Файлы: `src/modules/checkout/submit-order.ts`,
  `src/modules/checkout/components/checkout-form.tsx`, `src/modules/cart/store.ts`,
  `src/modules/cart/store.test.ts`, `src/styles/globals.css`, `tests/e2e/checkout.spec.ts`,
  `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением в `postcss.config.mjs`;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 24 теста успешно; `npm run build` —
  успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npm run test:e2e -- tests/e2e/checkout.spec.ts` —
  4 Chromium-сценария успешно. Desktop 1440×900 визуально проверен снимком Playwright; pending,
  success, offline-error, сохранение значений и очистка корзины проверены поведением.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для подключения к существующему
  локальному dev-серверу.
- Архитектура: контракт отправки изолирован в checkout-модуле и пригоден для замены реальным
  серверным transport без изменения UI. Security review клиентских границ не выявил новых
  подтверждённых findings; данные формы, localStorage, цена и номер остаются недоверенными.
- Ограничения: до backend-пунктов 30–31 transport создаёт только клиентский mock-заказ и не сохраняет
  его на сервере; серверная валидация, атомарная запись и настоящий номер заказа обязательны перед
  production. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 27 — Пользовательские формы авторизации

- Результат: создана адаптивная страница `/login` с режимами входа, регистрации и восстановления пароля, React Hook Form + Zod-валидацией, доступным показом пароля и состояниями pending/error/success; интерфейс честно обозначает frontend preview до подключения Auth.js.
- Файлы: `src/app/(store)/login/page.tsx`, `src/modules/auth/`, `src/styles/globals.css`, `tests/e2e/auth.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с существующим предупреждением `postcss.config.mjs`; `npm run typecheck` — успешно; `npm test -- --runInBand` — 26 тестов успешно; `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npx playwright test tests/e2e/auth.spec.ts` — 4 Chromium-сценария успешно; desktop 1440×1000 и mobile 390×844 визуально проверены через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для подключения к существующему локальному dev-серверу.
- Архитектура: без изменений; клиентский mock transport изолирован в auth-модуле и предназначен для замены серверной интеграцией. Security review не выявил подтверждённых уязвимостей в добавленной frontend-границе.
- Ограничения: до backend-пункта 25 аккаунты, сессии и письма восстановления не создаются; production требует серверной валидации, безопасного хранения паролей, Auth.js, rate limiting и унифицированных ответов без раскрытия существования email. Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 28 — Референсное изображение Login

- Результат: прежнее изображение hero на `/login` заменено отдельной production-фотографией,
  сгенерированной по утверждённому auth-концепту; сохранены композиция с окном, светлым диваном,
  деревянной консолью, абстрактным постером, деревом и чёрным журнальным столом.
- Файлы: `public/images/auth/login-interior.png`, `src/app/(store)/login/page.tsx`,
  `docs/progress.md`.
- Проверки: `npm run lint` и `npm run typecheck` — успешно; `npx next build --webpack` — успешно;
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3191 npx playwright test tests/e2e/auth.spec.ts` — 4 сценария
  успешно; desktop 1440×1000 и mobile 390×844 визуально сверены с исходным концептом, console errors
  отсутствуют.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright;
  стандартный Turbopack build в изолированном worktree не поддержал внешнюю junction-ссылку на
  `node_modules`, поэтому эквивалентная production-сборка проверена штатным webpack fallback Next.js.

## Task 29 — Изображение Login под Header

- Результат: desktop-изображение на `/login` поднято под полупрозрачный Header на его полную высоту
  `80px`; форма и мобильная последовательность блоков сохранены без смещения.
- Файлы: `src/styles/globals.css`, `tests/e2e/auth.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint`, `npm run typecheck`, `npm run build` и
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3180 npm run test:e2e -- tests/e2e/auth.spec.ts`;
  5 Chromium-сценариев успешно, desktop 1440×1000 визуально проверен.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 30 — Референсное изображение About

- Результат: прежний общий hero-asset на `/about` заменён отдельной production-фотографией,
  воссозданной из исходного визуального концепта страницы: сохранены деревянная консоль, лампа,
  абстрактная работа, журнальный стол, плетёное кресло, дерево и столовая зона справа.
- Файлы: `public/images/about/about-interior.png`, `src/app/(store)/about/page.tsx`,
  `src/app/(store)/about/page.test.tsx`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS из основного
  дерева и локального worktree; `npm run typecheck` — успешно; `npm test -- --runInBand` — 52 теста
  успешно с предупреждением Jest о дублирующем `package.json` в существующем worktree;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3192 npm run test:e2e -- tests/e2e/about-page.spec.ts` —
  4 Chromium-сценария успешно; desktop 1440×1000 и mobile 390×844 визуально сверены с исходным
  About-концептом.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright;
  изображение создано встроенным Image Gen из сохранённого референса.

## Task 31 — Страница личного кабинета

- Результат: создана адаптивная страница `/profile` с редактированием личных данных, актуальной
  гостевой корзиной из Zustand и демонстрационной историей заказов со статусами; preview-режим и
  отсутствие серверного хранения явно обозначены в интерфейсе.
- Файлы: `src/app/(store)/profile`, `src/modules/users`, `src/styles/globals.css`,
  `tests/e2e/profile.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 20 suites и 55 тестов успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3195 npm run test:e2e -- tests/e2e/profile.spec.ts` —
  2 Chromium-сценария успешно, console errors отсутствуют; desktop 1440×1000 и mobile 390×844
  визуально проверены.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: добавлен предусмотренный архитектурой frontend-модуль `users`; server/client-граница
  сохранена, данные профиля и заказов передаются в интерактивный остров как безопасные DTO.
- Ограничения: до backend-пунктов 25 и 32 Auth.js, серверное сохранение профиля и настоящая история
  заказов отсутствуют; синхронизация гостевой и серверной корзин относится к пункту 15. Browser
  plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 32 — Синхронизация корзины при авторизации

- Результат: реализован frontend-контракт синхронизации гостевой и пользовательской корзин при
  демонстрационном входе, выходе и повторном входе; одинаковые конфигурации объединяются с лимитом
  количества, Zustand получает каноническое состояние transport, изменения авторизованной корзины
  сохраняются, а при выходе пользовательская корзина остаётся в серверном mock-хранилище и локальная
  копия очищается.
- Файлы: `src/modules/auth/session-provider.tsx`, `src/modules/auth/components/auth-forms.tsx`,
  `src/modules/cart/mock-transport.ts`, `src/modules/cart/sync.ts`, `src/modules/cart/store.ts`,
  `src/modules/users/components/profile-dashboard.tsx`, `src/app/providers.tsx`,
  `src/app/(store)/profile/page.tsx`, `src/modules/cart/sync.test.ts`, `tests/e2e/auth.spec.ts`,
  `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 21 suite и 57 тестов успешно;
  `npm run build` — успешно. Новый Playwright-сценарий добавлен, но финальный запуск заблокирован
  уже работающим в основном каталоге `next dev`: выполненный поверх него production build сделал
  текущую dev-сессию негидратируемой до перезапуска.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для попытки локальной
  E2E-проверки.
- Архитектура: UI зависит от узкого типизированного transport-контракта; mock явно хранит только
  корзину и маркер демонстрационной сессии, не содержит токенов или персональных данных и будет
  заменён настоящими Auth.js/API/Prisma на backend-пунктах 25 и 29.
- Ограничения: это frontend-прототип серверной корзины на versioned localStorage, а не настоящая
  серверная безопасность или межустройственная синхронизация. Security review не выявил
  подтверждённых findings; недоверенные localStorage-данные повторно валидируются Zod, цены и права
  не считаются доверенными.

## Task 33 — Административный вход и Dashboard

- Результат: создан маршрут `/admin` с отдельной формой административного входа, восстановлением и
  завершением демонстрационной сессии, responsive Dashboard с типизированными mock-показателями и
  активностью, а также навигацией, которая не ведёт на ещё не реализованные разделы.
- Файлы: `src/app/admin/page.tsx`, `src/modules/admin/`, `src/styles/globals.css`,
  `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 22 suite и 59 тестов успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test
tests/e2e/admin.spec.ts` — 2 сценария успешно; desktop 1440×900 и mobile 390×844 проверены
  Chromium-скриншотами вне репозитория.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений; route-композиция находится в `app`, логика формы, preview-сессия,
  mock transport и безопасные DTO изолированы в frontend-модуле `admin`.
- Ограничения: до backend-пунктов 25–26 preview-маркер в `sessionStorage` является только UI-gate,
  не серверной аутентификацией или авторизацией. Реальные admin-данные и мутации не подключены.
  Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright; WebKit-бинарник
  локально отсутствует, responsive-проверка выполнена в Chromium.

## Task 34 — Логин для демонстрационной админ-панели

- Результат: административная preview-форма переведена с email на логин и проверяет фиксированную
  демонстрационную пару логина и пароля; неверные значения показывают связанные с полями ошибки и
  не открывают Dashboard.
- Файлы: `src/modules/admin/components/admin-login-form.tsx`, `src/modules/admin/schemas.ts`,
  `src/modules/admin/schemas.test.ts`, `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 22 suite и 60 тестов успешно;
  `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test tests/e2e/admin.spec.ts` —
  2 сценария успешно; `npm run build` — успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений.
- Ограничения: фиксированная пара находится в клиентском bundle и предназначена только для preview;
  это не серверная аутентификация или защита реальных административных данных.

## Task 35 — Управление товарами в админ-панели

- Результат: реализован защищённый preview-маршрут `/admin/products` со списком и поиском товаров,
  созданием и редактированием карточек, загрузкой и удалением изображений галереи, статусами
  публикации и наличия, а также отдельным подтверждением удаления товара.
- Файлы: `src/app/admin/products/page.tsx`, `src/modules/admin/`, `src/styles/globals.css`,
  `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 22 suites и 63 теста успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3196 npm run test:e2e --
tests/e2e/admin.spec.ts` — 3 Chromium-сценария успешно. Desktop 1440×900 и mobile 390×844
  визуально проверены, console errors отсутствуют.
- Архитектура: общий admin shell переиспользуется Dashboard и каталогом; CRUD изолирован в
  типизированном mock-transport, а загруженные изображения остаются только в памяти preview.
- Ограничения: до backend-пунктов 25–28 sessionStorage остаётся только UI-gate, изменения не
  сохраняются между перезапусками, а изображения не отправляются в Cloudinary. Серверные role-check,
  повторная Zod-валидация, проверка сигнатуры файлов и постоянное хранение обязательны перед
  production. Security review не выявил подтверждённых findings в реализованной frontend-границе.
  Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright.

## Task 36 — Просмотр заказов в админ-панели

- Результат: реализован защищённый preview-маршрут `/admin/orders` со списком и поиском заказов,
  выбором заявки и адаптивной панелью деталей; отображаются состав, количество, итоговая сумма,
  контактные данные покупателя, комментарий и текущий статус.
- Файлы: `src/app/admin/orders/page.tsx`, `src/modules/admin/components/admin-order-details.tsx`,
  `src/modules/admin/components/admin-orders-gate.tsx`,
  `src/modules/admin/components/admin-orders-manager.tsx`, `src/modules/admin/mock-data.ts`,
  `src/modules/admin/mock-transport.ts`, `src/modules/admin/types.ts`, `src/styles/globals.css`,
  `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm test -- --runInBand src/modules/admin` — 2 suites и 7 тестов успешно;
  `npm run typecheck` — успешно; `npm run lint` — без ошибок, с двумя существующими
  предупреждениями PostCSS; `npm run build` — успешно;
  `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test tests/e2e/admin.spec.ts
--project=chromium` — 4 Chromium-сценария успешно; `git diff --check` — успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: UI использует типизированный read-only mock-transport и общий admin shell; реальные
  серверные заказы, role-check и DTO остаются за backend-пунктами 25–26 и 32.
- Ограничения: preview-session в `sessionStorage` является только UI-gate; данные демонстрационные,
  смена статуса относится к пункту 19. Security review не выявил подтверждённых findings в новой
  read-only frontend-границе. Browser plugin недоступен, поэтому rendered QA выполнен Playwright.

## Task 37 — Управление статусами заказов

- Результат: в деталях заказа добавлены только допустимые действия смены статуса, состояние
  сохранения и доступная ошибка; после успешной preview-мутации badge и набор следующих действий
  обновляются без повторной загрузки списка. Переходы и строгий DTO централизованы и повторно
  проверяются transport-слоем.
- Файлы: `src/modules/admin/types.ts`, `src/modules/admin/schemas.ts`,
  `src/modules/admin/mock-transport.ts`, `src/modules/admin/components/admin-order-details.tsx`,
  `src/modules/admin/components/admin-orders-manager.tsx`, `src/styles/globals.css`,
  `src/modules/admin/*.test.ts*`, `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — без ошибок, с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 23 suite и 68 тестов успешно;
  transport regression — 2 теста успешно; `npm run build` — успешно;
  `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test tests/e2e/admin.spec.ts
--project=chromium` — 5 Chromium-сценариев успешно. Desktop 1440×900 и mobile 390×844
  визуально проверены, console errors отсутствуют; `git diff --check` — успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений; доменный инвариант переходов размещён в admin-модуле, transport
  остаётся preview-адаптером до реализации серверного контракта.
- Ограничения: preview-session и данные остаются клиентскими и хранятся только в памяти; реальная
  серверная авторизация администратора, конкурентная проверка текущего статуса и атомарное сохранение
  относятся к backend-пунктам 25–26 и 33. Security review не выявил подтверждённых findings в
  реализованной frontend-границе. Browser plugin недоступен, поэтому rendered QA выполнен Playwright.

## Task 38 — Настройки магазина в админ-панели

- Результат: реализован защищённый preview-маршрут `/admin/settings` с адаптивной формой названия,
  описания, телефона, почты, часов работы, адреса и ссылок Instagram, Pinterest и Telegram;
  добавлены состояния загрузки, ошибки и сохранения, строгая Zod-валидация и обновление интерфейса
  без перезагрузки страницы.
- Файлы: `src/app/admin/settings/page.tsx`, `src/modules/admin/components/admin-settings-gate.tsx`,
  `src/modules/admin/components/admin-settings-manager.tsx`, `src/modules/admin/components/admin-shell.tsx`,
  `src/modules/admin/mock-data.ts`, `src/modules/admin/mock-transport.ts`,
  `src/modules/admin/schemas.ts`, `src/modules/admin/types.ts`, `src/styles/globals.css`,
  `src/modules/admin/schemas.test.ts`, `tests/e2e/admin.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — без ошибок, с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 24 suites и 72 теста успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test
tests/e2e/admin.spec.ts --project=chromium` — 6 Chromium-сценариев успешно; `git diff --check` —
  успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений; настройки проходят через типизированный mock-transport и строгий DTO,
  интерактивность изолирована в client-компоненте внутри статического App Router route.
- Ограничения: до backend-пунктов 25–26, 34 и database-пункта 43 preview-session остаётся только
  UI-gate, а настройки хранятся в памяти процесса и не изменяют публичные страницы. Реальные
  server-side role-check, повторная валидация и постоянное хранение обязательны перед production.
  Security review не выявил подтверждённых findings в реализованной frontend-границе. Browser
  plugin недоступен, поэтому interaction QA выполнен проектным Playwright.

## Task 39 — Доступность, адаптивность и анимации frontend

- Результат: добавлены доступный skip-link и перенос фокуса к основному содержимому, единый
  умеренный Framer Motion-переход экранов с поддержкой `prefers-reduced-motion`; устранены
  горизонтальные переполнения мобильного header и hero страницы `/about` на ширине 320 px.
  Клавиатурное открытие, закрытие по Escape и возврат фокуса для мобильного меню закреплены E2E.
- Файлы: `src/app/layout.tsx`, `src/components/layout/route-transition.tsx`,
  `src/styles/globals.css`, `tests/e2e/accessibility.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — без ошибок, с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 24 suites и 72 теста успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://localhost:3194 npm run test:e2e --
tests/e2e/accessibility.spec.ts tests/e2e/header.spec.ts --project=chromium` — 9 сценариев
  успешно; desktop 1440×900 и mobile 390×844 проверены Chromium-скриншотами вне репозитория.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений; клиентская motion-обёртка расположена в layout-слое и использует
  `LazyMotion`, не меняя границы feature-модулей.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright;
  установлен только Chromium, межбраузерная проверка не выполнялась.

## Task 40 — Тесты ключевых frontend-сценариев

- Результат: добавлены Jest component-тесты конфигуратора товара и корзины, а также сквозной
  Playwright-сценарий от каталога и выбора конфигурации до успешного оформления заказа и очистки
  корзины. Стабилизированы существующие геометрические E2E-проверки после route-анимации и
  одноразовая подготовка preview-корзины между навигациями.
- Файлы: `src/modules/catalog/components/product-configurator.test.tsx`,
  `src/modules/cart/components/cart-widget.test.tsx`, `tests/e2e/shopping-journey.spec.ts`,
  `tests/e2e/about-page.spec.ts`, `tests/e2e/auth.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint` — без ошибок, с двумя существующими предупреждениями PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 26 suites и 76 тестов успешно;
  `npm run build` — успешно; `PLAYWRIGHT_BASE_URL=http://localhost:3194 npx playwright test
--project=chromium` — 43 сценария успешно; `git diff --check` — успешно.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использовалась только для локальной E2E-проверки.
- Архитектура: без изменений; добавлены только тесты наблюдаемого поведения.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен проектным Playwright;
  установлен только Chromium, межбраузерная проверка не выполнялась.

## Task 41 — Карта страниц и функций сайта

- Результат: создан Product Tour с фактическими публичными и административными URL, обзором
  разделов, общей навигации и основных функций, а также прямой картой файлов для корректировки
  контента, компонентов, данных и стилей. Отдельно отмечены preview-сценарии и ещё не реализованные
  возможности.
- Файлы: `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: `npx prettier --check docs/ProductTour.md docs/progress.md` — успешно;
  `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений; документ описывает существующие App Router routes и модульные границы.
- Ограничения: карта отражает фактическое состояние проекта на момент создания и требует обновления
  при добавлении маршрутов или переносе компонентов.

## Task 42 — Исправление Vercel-сборки до появления Prisma schema

- Результат: удалён преждевременный `postinstall` с `prisma generate`, из-за которого установка
  зависимостей на Vercel завершалась ошибкой при отсутствии ещё не реализованной Prisma schema.
  Ручные Prisma-команды и зависимости сохранены для будущего database-этапа.
- Файлы: `package.json`, `docs/progress.md`.
- Проверки: `npm install --ignore-scripts=false --package-lock=false --prefer-offline` — успешно;
  `npx eslint . --ignore-pattern ".worktrees/**"` — без ошибок, с одним существующим предупреждением
  PostCSS; `npm run typecheck` — успешно; `npm test -- --runInBand` — 34 suites и 100 тестов
  успешно; `npm run build` — успешно; `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений; Prisma остаётся запланированным server-only data-access слоем.
- Ограничения: `prisma:generate`, `prisma:validate`, `prisma:migrate` и `prisma:studio` станут
  рабочими после добавления schema в отдельной database-задаче.

## Task 43 — Усиление ESLint-проверок

- Результат: lint исключает вложенные worktree и генерируемые отчёты; для TypeScript включены
  type-aware проверки потерянных и некорректно используемых Promise и исчерпывающих `switch`.
  Архитектурные overrides запрещают зависимости `shared` от верхних слоёв и импорт privileged
  server-кода из UI и клиентских entry points.
- Файлы: `eslint.config.mjs`, `docs/progress.md`.
- Проверки: `npm run lint` — без ошибок, с одним существующим предупреждением PostCSS;
  `npm run typecheck` — успешно; `npm test -- --runInBand` — 34 suites и 100 тестов успешно;
  `npm run build` — успешно; effective config проверен программно для `shared` и UI-файлов.
- Переменные окружения: нет.
- Архитектура: документ не изменялся; ESLint теперь автоматически контролирует часть существующих
  границ из `docs/architecture.md`.
- Ограничения: глубокие межмодульные импорты и циклы пока не проверяются автоматически, поскольку
  для этого сначала нужны публичные entry points модулей либо отдельный ESLint-плагин.

## Task 44 — Устранение предупреждения PostCSS lint

- Результат: анонимный default export PostCSS-конфигурации заменён именованной константой;
  полный запуск ESLint теперь завершается без ошибок и предупреждений.
- Файлы: `postcss.config.mjs`, `docs/progress.md`.
- Проверки: `npm run lint` — успешно без предупреждений; `npm run typecheck` — успешно;
  `npm test -- --runInBand` — 34 suites и 100 тестов успешно; `npm run build` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Ограничения: нет.

## Task 45 — Правило актуализации Product Tour

- Результат: протокол завершения теперь требует проверять актуальность `docs/ProductTour.md` и
  обновлять его при изменении маршрутов, навигации, функций, сценариев или карты ключевых файлов;
  для внутренних технических изменений явно закреплено отсутствие лишних обновлений документа.
- Файлы: `AGENTS.md`, `.codex/rules/completion.md`, `docs/progress.md`.
- Проверки: `npx prettier --check AGENTS.md .codex/rules/completion.md docs/progress.md` и
  `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений; задача меняет правило сопровождения, а не карту продукта.
- Ограничения: правило выполняется агентом в протоколе завершения и не является автоматической
  проверкой содержимого документа в CI.

## Task 46 — Двухуровневая навигация Header

- Результат: desktop-шапка перестроена в два уровня с центрированным логотипом сверху и единой
  нижней строкой навигации и действий; порядок ссылок — «Каталог», «Магазины», «Новинки», «Акции»,
  «О нас». Мобильное меню синхронизировано с desktop-навигацией.
- Файлы: `src/components/layout/header.tsx`, `src/components/layout/mobile-navigation.tsx`,
  `src/styles/globals.css`, `src/components/layout/header.test.tsx`, `tests/e2e/header.spec.ts`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript и production build — успешно; 3 header E2E-сценария в
  Chromium — успешно; desktop 1440×900 и mobile 390×844 проверены через Playwright и `view_image`,
  ошибок Console, перекрытий и обрезки нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использована только для локального E2E-запуска.
- Архитектура: без изменений; Header остаётся Server Component, мобильный dialog — клиентской
  границей.
- Product Tour: обновлён раздел «Общая навигация и Header».
- Ограничения: отдельные маршруты акций и новинок пока отсутствуют, поэтому ссылки ведут на
  существующий каталог; «Магазины» ведёт к контактам существующего шоурума на странице «О нас».
  Browser plugin недоступен, rendered QA выполнен через проектный Playwright.

## Task 47 — Mega-menu каталога в Header

- Результат: пункт «Каталог» больше не переводит пользователя сразу на отдельную страницу, а
  открывает широкую desktop mega-menu под шапкой в редакционной стилистике и адаптивную мобильную
  панель. Добавлены десять категорий и ссылка «Весь каталог», нативное dialog-поведение, Escape,
  backdrop, явное закрытие, возврат фокуса и закрытие при переходе.
- Файлы: `src/components/layout/catalog-menu.tsx`, `src/components/layout/header.tsx`,
  `src/components/layout/mobile-navigation.tsx`, `src/styles/globals.css`,
  `src/components/layout/header.test.tsx`, `tests/e2e/header.spec.ts`, `docs/ProductTour.md`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, Jest, production build и desktop/mobile Playwright — успешно;
  desktop 1440×900 и mobile 390×844 проверены через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использована только для локального E2E-запуска.
- Архитектура: без изменений; интерактивная панель изолирована в Client Component, Header остаётся
  Server Component.
- Product Tour: обновлён раздел «Шапка сайта» и карта ключевых файлов.
- Ограничения: категории временно ведут на общий `/catalog`; фильтрация по категории не реализована.
  Browser plugin недоступен, rendered QA выполнен через проектный Playwright.

## Task 48 — Плавное раскрытие mega-menu

- Результат: mega-menu каталога плавно выезжает сверху вниз и сохраняется в DOM до завершения обратного перехода; содержимое появляется вместе с панелью с коротким stagger, а нижний разделитель меняет контраст во время движения. Для reduced motion переходы отключены. Пять desktop-пунктов навигации распределены равномерно относительно прежнего центра и без смещения всей группы.
- Файлы: `src/components/layout/catalog-menu.tsx`, `src/styles/globals.css`, `tests/e2e/header.spec.ts`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 17 Jest suites / 50 тестов, production build и 6 header E2E-сценариев в Chromium — успешно; desktop 1280×720 и mobile 390×844 проверены через Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` и `QA_SCREENSHOT_DIR` использованы только для локального E2E-запуска.
- Архитектура: без изменений; управляемая фаза закрытия остаётся внутри существующего Client Component и завершается по `transitionend`, без таймеров.
- Product Tour: без изменений; маршруты, переходы, ключевые файлы и пользовательский сценарий не изменились.
- Ограничения: категории по-прежнему ведут на общий `/catalog`; Browser plugin недоступен, rendered QA выполнен через проектный Playwright.

## Task 49 — Устранение обратного скачка mega-menu

- Результат: после завершения анимации закрытия dialog сохраняет состояние `closing` до следующего
  открытия, поэтому панель остаётся за верхней границей и больше не пытается повторно выехать перед
  скрытием. Состояние стрелки «Каталог» переключается в начале обратного движения панели, а не после
  её полного закрытия.
- Файлы: `src/components/layout/catalog-menu.tsx`, `tests/e2e/header.spec.ts`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint и TypeScript — успешно; 6 header E2E-сценариев в Chromium — успешно;
  regression-проверка подтверждает сохранение закрытого положения панели после `dialog.close()` и
  немедленное переключение `aria-expanded` у стрелки.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использована только для локального E2E-запуска.
- Архитектура: без изменений; исправлен жизненный цикл визуального состояния существующего dialog.
- Product Tour: без изменений; пользовательский сценарий и карта ключевых файлов не изменились.
- Ограничения: Browser plugin недоступен, проверка выполнена через проектный Playwright.

## Task 50 — Скрытие полос прокрутки

- Результат: визуальные scrollbar скрыты глобально во всех прокручиваемых областях; прокрутка
  колёсиком, клавиатурой и касанием сохраняется.
- Файлы: `src/styles/globals.css`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` — успешно; сервер отдельной ветки отвечает на порту 3210.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений; пользовательские маршруты и сценарии не изменились.
- Ограничения: системный индикатор положения прокрутки намеренно больше не отображается.

## Task 51 — Страница категории «Посуда»

- Результат: пункт «Посуда» в существующей панели каталога ведёт на новую адаптивную страницу
  `/catalog/tableware` с описанием категории и одной карточкой набора тарелок Lumo; товар можно
  добавить в корзину или открыть на отдельной странице.
- Файлы: `src/app/(store)/catalog/tableware/page.tsx`,
  `src/components/layout/catalog-menu.tsx`, `src/modules/catalog/mock-data.ts`,
  `src/styles/globals.css`, `public/images/tableware/lumo-plates.png`, тесты и документация.
- Проверки: `npm run lint`, `npm run typecheck`, 50 Jest-тестов, `npm run build` и 10 профильных
  Chromium E2E-сценариев — успешно; desktop 1440×1000 и mobile проверены через Chrome DevTools,
  ошибок Console нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использована только для локального E2E-запуска.
- Архитектура: новый маршрут использует существующие `ProductPreview`, mock-слой каталога и cart
  store; новых зависимостей и клиентских границ не добавлено.
- Product Tour: добавлены маршрут `/catalog/tableware`, переход из mega-menu и карта ключевых
  файлов категории.
- Ограничения: остальные категории по-прежнему ведут в общий каталог; товар Lumo хранится в
  демонстрационном mock-слое.

## Task 52 — Чёткое изображение карточки посуды

- Результат: изображение набора Lumo заполняет медиаобласть карточки без фоновых полос, а
  `next/image` получает корректный responsive-размер широкого блока и максимальное разрешённое
  качество `100` вместо общего каталожного пресета.
- Файлы: `src/modules/catalog/components/product-preview.tsx`,
  `src/app/(store)/catalog/tableware/page.tsx`, `src/styles/globals.css`,
  `tests/e2e/catalog.spec.ts`, `docs/progress.md`.
- Проверки: `npm run lint`, `npm run typecheck` и 4 Chromium E2E-сценария каталога — успешно;
  desktop 1440×1000 проверен через Chrome DevTools, полос и ошибок Console нет.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` использована только для локального E2E-запуска.
- Архитектура: без изменений; `ProductPreview` получил необязательные параметры оптимизации
  изображения с сохранением прежних значений по умолчанию.
- Product Tour: без изменений; маршрут, навигация и пользовательский сценарий не изменились.
- Ограничения: нет.

## Task 53 — Страница категории «Стулья»

- Результат: пункт «Стулья» в существующей панели каталога ведёт на новую адаптивную страницу
  `/catalog/chairs` с описанием и тремя товарами: существующим Arco и новыми Noma и Tera; карточки
  поддерживают добавление в корзину и переход на статически генерируемые страницы товара.
- Файлы: `src/app/(store)/catalog/chairs/page.tsx`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/modules/cart/validation.ts`,
  `public/images/chairs/`, тесты и документация.
- Проверки: `npm run lint`, `npm run typecheck`, 51 Jest-тест, `npm run build` и 11 профильных
  Chromium E2E-сценариев — успешно; desktop 1440×1000 и mobile 390×844 визуально сверены через
  Playwright и `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL` и `QA_SCREENSHOT_DIR` использованы только для
  локальной E2E/визуальной проверки.
- Архитектура: category-only товары собраны в `chairCategoryProducts`, а единый `allProducts`
  используется страницами товара и валидацией корзины без расширения главной и общего каталога.
- Product Tour: добавлены маршрут `/catalog/chairs`, переход из mega-menu и карта ключевых файлов.
- Ограничения: Chrome DevTools был недоступен из-за лимита инструмента; rendered QA выполнен через
  проектный Playwright.

## Task 54 — Страница категории «Диваны»

- Результат: пункт «Диваны» в существующей панели каталога ведёт на новую адаптивную страницу
  `/catalog/sofas` с описанием и пятью товарами: существующим Modul и новыми Lento, Vela, Nord и
  Aura. Карточки поддерживают добавление в корзину и переход на статически генерируемые страницы
  товаров.
- Файлы: `src/app/(store)/catalog/sofas/page.tsx`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/sofas/`, тесты и
  документация.
- Проверки: Prettier, ESLint, TypeScript, 7 затронутых Jest-тестов, production build и 6 Chromium
  E2E-сценариев каталога — успешно; desktop 1440×1000 и mobile 390×844 визуально сверены через
  Playwright и `view_image`. Полный Jest-запуск обнаруживает дубли тестов в существующем
  `.worktrees/catalog-drawer` и падает из-за двух копий React; тесты основной рабочей ветки проходят.
- Переменные окружения: `PLAYWRIGHT_BASE_URL`, `PORT` и `QA_SCREENSHOT_DIR` использованы только для
  локальной E2E/визуальной проверки.
- Архитектура: новые category-only товары собраны в `sofaCategoryProducts`, а `allProducts`
  обеспечивает страницы товара и проверку корзины без расширения главной страницы и общего
  каталога.
- Product Tour: добавлены маршрут `/catalog/sofas`, переход из mega-menu и карта ключевых файлов
  категории.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен через проектный Playwright.
  Четыре новых изображения товаров созданы встроенным Image Gen в визуальном стиле существующего
  изображения Modul.

## Task 55 — Быстрый просмотр на карточках категорий

- Результат: существующая панель быстрого просмотра `ProductPreview` снова открывается на desktop
  при наведении мыши и клавиатурном фокусе для всех карточек на страницах диванов, стульев и посуды.
- Причина: category-specific стили принудительно скрывали `.product-preview__quick-view` и обрезали
  абсолютно позиционированную панель через `overflow: hidden`.
- Файлы: `src/styles/globals.css`, `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, production build и существующие Chromium E2E-сценарии
  каталога — успешно; панели на страницах диванов, стульев и посуды проверены через Playwright,
  панель диванов дополнительно сверена визуально через `view_image`.
- Переменные окружения: `PLAYWRIGHT_BASE_URL`, `PORT` и `QA_SCREENSHOT_DIR` использованы только для
  локальной E2E/визуальной проверки.
- Архитектура: без изменений; переиспользуется существующий `ProductPreview`, новый клиентский код
  и зависимости не добавлялись.
- Product Tour: уточнено единое поведение быстрого просмотра в общем каталоге и категориях.
- Ограничения: на touch/mobile hover-панель намеренно не показывается; основные действия карточки
  остаются доступны напрямую. Тесты не изменялись согласно актуальному правилу проекта для
  существующего функционала.

## Task 56 — Правила изменения тестов и E2E

- Результат: добавлена обязательная маршрутизация к правилам тестирования; самостоятельные изменения
  ограничены `playwright.config.ts`, а существующие тесты и E2E-сценарии разрешено изменять только
  после явного согласия пользователя. Зафиксированы пять приоритетных сквозных E2E-потоков проекта.
- Файлы: `AGENTS.md`, `.codex/rules/testing.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` для изменённых нормативных файлов — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: существующие файлы `tests/e2e/**` не изменялись в рамках этой задачи.

## Task 57 — Локализация frontend-правила Next.js

- Результат: копия предупреждения об особенностях установленной версии Next.js в frontend-правилах
  переведена на русский язык и отформатирована по соглашениям проекта.
- Файлы: `.codex/rules/frontend.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` для изменённых нормативных файлов — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: автоматически поддерживаемый Next.js блок остаётся в `AGENTS.md`; `next dev` может
  повторно обновлять его независимо от копии в frontend-правилах.

## Task 58 — Единое отображение изображений диванов

- Результат: карточки диванов и галерея товара используют квадратную область изображения и
  `object-fit: contain`, поэтому фотография показывается полностью без обрезания добавленных полей.
  Формат карточек стульев `4 / 5` сохранён.
- Файлы: `src/styles/globals.css`, `public/images/sofas/vela.png`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 52 Jest-теста и production build — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: браузерная визуальная проверка не запускалась; E2E-файлы не изменялись.

## Task 59 — Единый стиль изображений в карточках товара

- Результат: карточки общего каталога, диванов, стульев и посуды используют квадратную область
  изображения, `object-fit: contain` и единый мягкий фон. Масштабирование при наведении убрано,
  поэтому края изображения не обрезаются.
- Файлы: `src/styles/globals.css`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 52 Jest-теста текущего проекта и production build — успешно;
  страницы диванов, стульев и посуды проверены через Playwright на desktop, стулья — также на mobile.
- Переменные окружения: нет.
- Архитектура: без изменений; все страницы продолжают использовать общий `ProductPreview`.
- Product Tour: без изменений.
- Ограничения: штатный `npm test` дополнительно обнаруживает тесты в `.worktrees/catalog-drawer` и
  падает из-за второй копии React. Существующий `tests/e2e/catalog.spec.ts` не изменялся; 5 из 6
  сценариев не проходят из-за неактуальных ожиданий и навигации.

## Task 60 — Уточнение кратких архитектурных правил

- Результат: краткие правила синхронизированы с основным архитектурным документом; уточнены роли
  `components`, `shared`, модулей и server-only слоя, публичные client/server-контракты, DTO,
  временный статус mock-реализаций и возможная проверка импортов средствами ESLint.
- Файлы: `.codex/rules/architecture.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` для архитектурного правила — успешно.
- Переменные окружения: нет.
- Архитектура: уточнено краткое нормативное правило без изменения принятой архитектуры приложения.
- Product Tour: без изменений.
- Ограничения: автоматическая ESLint-проверка границ модулей не добавлялась; правило описывает момент,
  когда её следует рассмотреть.

## Task 61 — Синхронизация полной архитектуры с mock-каркасом

- Результат: основной архитектурный документ разделяет фактическое и целевое состояние, помечает
  текущие и будущие элементы структуры, описывает страницы категорий, общие товарные компоненты,
  mega-menu, временный mock-слой и порядок устранения глубоких межмодульных импортов.
- Файлы: `docs/architecture.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` для нормативной документации — успешно.
- Переменные окружения: нет.
- Архитектура: уточнены статусы реализации и правила перехода к production/backend без изменения
  выбранного модульного монолита.
- Product Tour: без изменений; маршруты и пользовательские сценарии не менялись.
- Ограничения: расхождение имени динамического сегмента товара и используемого slug намеренно не
  изменялось по запросу пользователя; автоматические ESLint-ограничения импортов не добавлялись.

## Task 62 — Раскрывающийся поиск в Header

- Результат: добавлен адаптивный раскрывающийся поиск с надёжным автофокусом, закрытием по повторному
  нажатию, Escape и клику снаружи, возвратом фокуса и безопасной GET-отправкой непустого запроса.
  Поверхность раскрытого поиска совпадает с hover-состоянием кнопки без focus-артефактов; на экранах
  до 425px включительно поле раскрывается отдельной строкой под логотипом.
- Файлы: `src/components/layout/header-search.tsx`, `src/components/layout/header.tsx`,
  `src/styles/globals.css`, `src/components/layout/header.test.tsx`, `tests/e2e/header.spec.ts`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 17 Jest-наборов (52 теста) и production build — успешно.
  Playwright на 1280px, 425px и 390px подтвердил раскрытие, автофокус, ввод без дополнительного клика,
  повторное открытие, мобильное положение под логотипом и отсутствие ошибок в консоли; на 426px
  сохранена прежняя компоновка.
- Переменные окружения: нет.
- Архитектура: Header сохранён Server Component, клиентское состояние изолировано в `HeaderSearch`.
- Product Tour: обновлены раздел Header и ограничение поиска.
- Ограничения: каталог пока не фильтрует товары по параметру `search`; полный Jest без исключения
  `.worktrees` захватывает тесты соседних рабочих деревьев с отдельными копиями React, поэтому итоговая
  проверка выполнена для текущего рабочего дерева.

## Task 63 — Страница категории «Кровати»

- Результат: пункт «Кровати» в существующей динамической панели каталога направлен на `/catalog/beds`;
  добавлена отдельная страница с описанием категории и ровно тремя карточками Nubi, Ardea и Linea.
- Исправление: изображения всех трёх карточек категории загружаются eagerly с проектным качеством
  Next.js по умолчанию; устранена долгая параллельная оптимизация трёх PNG с `quality={100}`.
- Файлы: `src/app/(store)/catalog/beds/`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/beds/`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, Jest, production build и визуальная проверка Playwright на
  desktop и mobile — успешно.
- Переменные окружения: `PORT` и `QA_SCREENSHOT_DIR` использованы только для локальной визуальной проверки.
- Архитектура: без изменений; переиспользованы существующие `ProductPreview` и mock-слой каталога.
- Product Tour: добавлена карта маршрута `/catalog/beds` и связанных файлов.
- Ограничения: изображения созданы генеративно для демонстрационного каталога; существующие E2E-тесты
  не изменялись согласно правилам проекта.

## Task 64 — Страница категории «Матрасы»

- Результат: пункт «Матрасы» в существующей динамической панели каталога направлен на
  `/catalog/mattresses`; добавлена отдельная страница с описанием категории и ровно тремя карточками
  Alba, Forma и Noma. Общий динамический маршрут товара поддерживает переход из каждой карточки.
- Файлы: `src/app/(store)/catalog/mattresses/`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/mattresses/`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript и production build через webpack — успешно; Playwright на
  desktop и mobile подтвердил 200-ответ страницы, ровно три карточки, загрузку трёх изображений и
  клавиатурный переход на страницу товара без ошибок консоли.
- Переменные окружения: `NODE_PATH` использован только для локальной визуальной проверки.
- Архитектура: без изменений; переиспользованы существующие `ProductPreview`, mock-слой и общий
  динамический маршрут товара.
- Product Tour: добавлена карта маршрута `/catalog/mattresses` и связанных файлов.
- Ограничения: изображения и дизайн-концепт созданы генеративно для демонстрационного каталога;
  Jest не обнаруживает тесты внутри `.worktrees`, поэтому новый component-тест добавлен, но не был
  выполнен в изолированном worktree. Существующие E2E-тесты не изменялись.

## Task 65 — Страница категории «Текстиль и декор»

- Результат: пункт «Текстиль и декор» в существующей динамической панели каталога направлен на
  `/catalog/textiles-decor`; добавлена отдельная страница с содержательным описанием категории и ровно
  тремя карточками товаров: плед Lino, подушка Miro и ваза Sora.
- Файлы: `src/app/(store)/catalog/textiles-decor/`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/textiles-decor/`,
  `docs/ProductTour.md`, `docs/progress.md`.
- UI: переиспользованы существующие `ProductPreview` и адаптивный паттерн страниц категорий;
  квадратные изображения созданы генеративно без пустых полос.
- Каталог: новые товары включены в `allProducts`, поэтому detail-переходы работают через общий
  динамический маршрут `/product/[id]`.
- Тестирование: добавлен component/integration-тест страницы на описание, ровно три карточки и названия
  товаров; существующие E2E-файлы не изменялись.
- Проверки: Prettier для затронутых файлов, ESLint, TypeScript, 55 Jest-тестов и production build через
  webpack пройдены; Playwright на 1440×1100 и 390×844 подтвердил ровно три карточки, загрузку трёх
  изображений с HTTP 200, отсутствие горизонтального переполнения и переход на страницу пледа Lino
  без ошибок консоли. Browser plugin в сессии недоступен, поэтому использован Playwright.
- Product Tour: добавлена карта маршрута `/catalog/textiles-decor` и связанных файлов.

## Task 66 — Страница категории «Столы обеденные»

- Результат: пункт «Столы обеденные» в существующей динамической панели каталога направлен на
  `/catalog/dining-tables`; добавлена отдельная страница с содержательным описанием категории и ровно
  тремя карточками товаров: Tavola, Orbis и Elara.
- Файлы: `src/app/(store)/catalog/dining-tables/`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/dining-tables/`,
  `docs/ProductTour.md`, `docs/progress.md`.
- UI: переиспользованы существующие `ProductPreview` и адаптивный паттерн страниц категорий; три
  согласованных квадратных изображения созданы генеративно без пустых полос.
- Каталог: новые товары включены в `allProducts`, поэтому detail-переходы работают через общий
  динамический маршрут `/product/[id]`.
- Тестирование: добавлен отдельный component/integration-тест страницы на описание, ровно три карточки
  и названия товаров; существующие E2E-файлы не изменялись.
- Проверки: Prettier для затронутых файлов, ESLint, TypeScript и production build через webpack
  пройдены; Playwright на 1440×1100 и 390×844 подтвердил HTTP 200, ровно три карточки, загрузку всех
  изображений (`naturalWidth > 0`), отсутствие горизонтального переполнения и ошибок консоли, а также
  переход на `/product/tavola-dining-table`. Browser plugin в сессии недоступен, поэтому использован
  Playwright.
- Product Tour: добавлена карта маршрута `/catalog/dining-tables` и связанных файлов.

## Task 67 — Папки изображений товаров и слайдер галереи

- Результат: существующие фотографии 23 товаров перенесены в подпапки категорий по полному slug и
  переименованы в `01-main.png`; страница товара получила доступный адаптивный слайдер со стрелками,
  счётчиком, миниатюрами, клавиатурным управлением и свайпом. При одном изображении лишние элементы
  управления не выводятся.
- Файлы: `public/images/{beds,chairs,dining-tables,mattresses,sofas,tableware,textiles-decor}`,
  `src/modules/catalog/mock-data.ts`, `src/modules/catalog/components/product-gallery.tsx`,
  `src/modules/catalog/components/product-gallery.test.tsx`, `src/styles/globals.css`,
  `docs/architecture.md`, `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 22 Jest suites и 58 тестов, production build — успешно;
  два целевых Chromium E2E-сценария перехода/добавления товара и мобильной страницы — успешно.
  Полный `catalog.spec.ts` выявил существующее несоответствие ожидания `object-fit: cover` для посуды
  фактическому стилю `contain`; E2E-файл по правилам проекта не изменялся.
- Переменные окружения: `PORT` и `PLAYWRIGHT_BASE_URL` использованы только для изолированного
  E2E-запуска.
- Архитектура: в `docs/architecture.md` закреплено локальное правило
  `public/images/<category-slug>/<product-slug>/<position>-<role>.<extension>`; production-хранилище
  Cloudinary не изменялось.
- Product Tour: обновлены описание галереи страницы товара и расположение локальных изображений.
- Ограничения: дополнительные фотографии `02–06` пользователь добавляет самостоятельно; до их
  добавления товары показывают единственное основное изображение без элементов переключения.

## Task 68 — Галереи диванов Lento и Aura

- Результат: галереи диванов Lento и Aura расширены до семи локальных изображений каждая; слайдер
  страницы товара получает основной вид, боковой ракурс, детали подлокотника и ножек, вид сверху,
  разложенный и дополнительный общий вид.
- Файлы: `public/images/sofas/lento-sofa/`, `public/images/sofas/aura-sofa/`,
  `src/modules/catalog/mock-data.ts`, `docs/progress.md`.
- Проверки: Prettier, проверка существования всех 35 изображений из mock-данных, ESLint, TypeScript,
  Jest и production build.
- Переменные окружения: нет.
- Архитектура: без изменений; использована существующая структура товарных подпапок и массива
  `gallery`.
- Product Tour: без изменений.
- Ограничения: нет.

## Task 69 — Фактическая и целевая структура проекта

- Результат: раздел 4 архитектуры разделён на фактическое дерево используемых маршрутов, модулей и
  ресурсов и отдельную целевую server-side структуру; пустые каталоги с `.gitkeep` явно не считаются
  реализованными слоями.
- Файлы: `docs/architecture.md`, `docs/progress.md`.
- Проверки: Prettier, ручная сверка фактического дерева с отслеживаемыми файлами, проверка ссылок на
  связанные документы и `git diff --check`.
- Переменные окружения: нет.
- Архитектура: уточнено документирование текущего mock-этапа и будущих Prisma, API, service и
  integration-слоёв без изменения принятых границ модульного монолита.
- Product Tour: без изменений.
- Ограничения: фактическое дерево намеренно компактное; полный список маршрутов и ключевых файлов
  остаётся в `docs/ProductTour.md`.

## Task 70 — Страница магазинов

- Результат: добавлен маршрут `/stores` с историей пространств Virtual Space и четырьмя адресами в
  Нью-Йорке, Москве, Минске и Париже; каждый магазин получил адаптивный слайдер из четырёх кадров,
  вкладки, стрелки и доступный счётчик. Пункты «Магазины» в desktop- и mobile-навигации ведут на
  новый маршрут.
- Файлы: `src/app/(store)/stores/page.tsx`, `src/modules/stores/**`,
  `src/components/layout/{header,mobile-navigation}.tsx`, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint и TypeScript — успешно; Playwright Chromium подтвердил desktop/mobile
  рендер `/stores` и переключение счётчика `01 / 04` → `02 / 04`. Полный Jest запускает тесты из
  существующих `.worktrees/**` с дублирующими React-зависимостями и содержит устаревшее ожидание
  старой ссылки «Магазины»; тесты по правилам проекта не изменялись без отдельного разрешения.
- Переменные окружения: нет.
- Архитектура: добавлен изолированный UI-модуль `stores` с типами, mock-данными и клиентским
  компонентом галереи; серверная страница остаётся в App Router.
- Product Tour: добавлены маршрут `/stores`, пользовательский сценарий и карта ключевых файлов.
- Ограничения: Browser plugin в сессии отсутствовал, поэтому визуальная проверка выполнена через
  локальный Playwright Chromium.

## Task 71 — Галереи магазинов по визуальному референсу

- Результат: страница `/stores` приведена к предоставленному референсу в дизайн-системе проекта:
  добавлен компактный вводный блок, чередующаяся раскладка информации и галереи, стрелки поверх
  крупного кадра и четыре кликабельные миниатюры. Кнопки «Подробнее о салоне» отсутствуют, текущие
  адреса сохранены.
- Файлы: `public/images/stores/**`, `src/app/(store)/stores/page.tsx`,
  `src/modules/stores/{types,mock-data}.ts`, `src/modules/stores/components/store-slider.tsx`,
  `src/styles/globals.css`, `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, production build и Playwright Chromium для desktop/mobile;
  переключение первой галереи с фасада на интерьер и состояние активной миниатюры подтверждены.
- Переменные окружения: нет.
- Архитектура: без изменений; использован существующий UI-модуль `stores`.
- Product Tour: актуализированы раскладка и управление галереей `/stores`.
- Ограничения: Browser plugin отсутствовал, поэтому визуальная проверка выполнена через локальный
  Playwright Chromium. Фотографии извлечены без перерисовки из предоставленного пользователем
  референса; их разрешение ограничено разрешением исходного изображения.

## Task 72 — 4K-реконструкция фотографий магазинов

- Результат: все 16 изображений галерей Нью-Йорка, Москвы, Минска и Парижа прошли отдельную
  AI-реконструкцию с восстановлением архитектурных, интерьерных и материальных деталей, после чего
  приведены к разрешению не ниже `3840×2160` и сохранены как оптимизированные JPEG.
- Файлы: `public/images/stores/{new-york,moscow,minsk,paris}/*.jpg`, `docs/progress.md`.
- Проверки: декодирование и размеры всех 16 JPEG проверены через System.Drawing; по одному ключевому
  кадру каждого города проверено визуально в исходном масштабе; production build выполнен успешно.
- Переменные окружения: нет.
- Архитектура: без изменений; пути изображений и UI-контракты сохранены.
- Product Tour: без изменений.
- Ограничения: изображения реконструированы из миниатюр референса, поэтому отдельные мелкие детали
  восстановлены генеративно; композиция, ракурс, тип сцены и фирменная вывеска сохранены.

## Task 73 — Страница категории «Пуфики»

- Результат: пункт «Пуфики» в динамическом меню каталога ведёт на `/catalog/poufs`; создана адаптивная
  страница с содержательным описанием и тремя карточками Arlo, Nola и Taro, связанными с общими страницами товаров.
- Файлы: `src/app/(store)/catalog/poufs/{page,page.test}.tsx`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `public/images/poufs/**`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier затронутых файлов, ESLint, TypeScript, Jest, production build и desktop/mobile
  Playwright QA — успешно; подтверждены три карточки, загрузка изображений, переход к товару,
  отсутствие ошибок консоли и горизонтального переполнения.
- Переменные окружения: нет.
- Архитектура: существующий поток `app -> modules/catalog -> ProductPreview` и общий динамический маршрут товара сохранены.
- Product Tour: добавлен раздел категории «Пуфики» и карта затронутых файлов.

## Task 74 — Изоляция Jest-тестов

- Результат: Jest ограничен каталогом `src`, поэтому штатный `npm test` больше не обнаруживает дубли тестов в `.worktrees` и не смешивает разные копии React.
- Файлы: `jest.config.ts`, `docs/progress.md`.
- Проверки: `npm test -- --runInBand` — 17 suites и 52 теста прошли; `npm run lint`, `npm run typecheck` и `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: `npm run build` в изолированном worktree не запущен до конца, так как Turbopack не разрешает использовать `node_modules` за границей filesystem root; новые зависимости не устанавливались.

## Task 75 — Страница категории «Кресла»

- Результат: пункт «Кресла» в динамическом меню каталога ведёт на `/catalog/armchairs`; создана
  адаптивная страница с содержательным описанием категории и ровно тремя товарными карточками.
- Файлы: `src/app/(store)/catalog/armchairs/{page,page.test}.tsx`,
  `src/components/layout/catalog-menu.tsx`, `src/modules/catalog/mock-data.ts`,
  `src/styles/globals.css`, `public/images/armchairs/**`, `docs/ProductTour.md`.
- Данные: в общий mock-каталог добавлены кресла Aster, Runa и Vero; карточки и detail-маршруты
  используют единый источник `allProducts`.
- Визуал: на основе полного ImageGen-концепта подготовлены три согласованных квадратных фото 1:1 с
  едиными светом, масштабом и нейтральным интерьерным фоном без пустых полос.
- Проверки: Prettier затронутых файлов, ESLint, TypeScript, 60 Jest-тестов и production build через
  webpack прошли; desktop/mobile Playwright QA подтвердил ровно три карточки, загрузку изображений,
  меню и detail-переход, отсутствие ошибок консоли и горизонтального переполнения.
- Переменные окружения: нет.
- Архитектура: сохранён поток `app -> modules/catalog -> ProductPreview` и общий динамический маршрут
  товара.
- Product Tour: добавлен раздел `/catalog/armchairs` и карта связанных файлов.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен через локальный Playwright
  Chromium; стандартный Turbopack build не принимает junction `node_modules` из worktree, поэтому
  эквивалентная production-сборка выполнена штатным флагом Next.js `--webpack`.

## Task 76 — Карточка Forma в категории «Кресла»

- Результат: существующее «Кресло Forma» добавлено четвёртой карточкой на страницу
  `/catalog/armchairs`; карточка ведёт на существующий маршрут `/product/forma-chair`.
- Файлы: `src/modules/catalog/mock-data.ts`, `docs/progress.md`.
- Архитектура: использован существующий товар из общего массива `products`, без дублирования его
  данных и без изменений страницы товара.
- Проверки: Prettier, ESLint, TypeScript, все 60 Jest-тестов и production-сборка Next.js через
  Webpack прошли успешно; тест обновлён с явного разрешения пользователя и проверяет четыре
  карточки, включая Forma и переход на `/product/forma-chair`.

## Task 77 — Ассет кресла Forma

- Результат: изображение кресла Forma перенесено из каталога стульев в каталог кресел; ссылки в
  mock-данных приведены в соответствие с категорией товара.
- Файлы: `src/modules/catalog/mock-data.ts`, `public/images/armchairs/forma-chair/01-main.png`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, точечный Jest-тест страницы `/catalog/armchairs` и
  `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: нет.

## Task 78 — Название каталога ассета Forma

- Результат: каталог изображения Forma переименован из `forma-chair` в `forma-armchair`; ссылки в
  mock-данных обновлены без изменения идентификатора, slug и маршрута товара.
- Файлы: `src/modules/catalog/mock-data.ts`, `public/images/armchairs/forma-armchair/01-main.png`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, точечный Jest-тест страницы `/catalog/armchairs` и
  `git diff --check` — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: нет.

## Task 79 — Единый slug кресла Forma

- Результат: идентификатор и slug кресла Forma переименованы из `forma-chair` в `forma-armchair`;
  карточки, маршрут товара, корзинные данные и связанные проверки используют единое имя.
- Файлы: `src/modules/catalog/mock-data.ts`, связанные unit-тесты в `src/**`, связанные сценарии
  `tests/e2e/**`, `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 60 Jest-тестов и production build — успешно; шесть
  целевых Playwright-сценариев с `http://localhost:3000` выполнились без падений тестов.
- Переменные окружения: нет.
- Архитектура: без изменений; сохранён общий динамический маршрут `/product/[id]`.
- Product Tour: пример адреса товара обновлён на `/product/forma-armchair`.
- Ограничения: полный E2E-запуск через штатный `127.0.0.1` блокировался Next.js dev-origin и вызвал
  каскадные 403; повторный набор через `localhost` выявил три несвязанных UI-падения, а точечный
  запуск шести затронутых сценариев завершил сами тесты успешно, но процесс Playwright пришлось
  остановить вручную из-за зависшего завершения web server.

## Task 80 — Галерея кресла Forma

- Результат: страница `/product/forma-armchair` использует девять согласованных квадратных кадров:
  основной вид, ракурс в три четверти, детали подлокотника, ткани и основания, боковой вид,
  lifestyle-сцену, схему размеров и общий интерьер; для каждого кадра задан содержательный alt-текст.
- Файлы: `src/modules/catalog/mock-data.ts`, `src/app/(store)/page.test.tsx`,
  `public/images/armchairs/forma-armchair/**`, `docs/progress.md`.
- Проверки: все девять PNG декодируются и имеют размер `1254×1254`; Prettier, ESLint, TypeScript,
  60 Jest-тестов, production build и существующий Playwright-сценарий страницы товара — успешно.
- Переменные окружения: нет.
- Архитектура: без изменений; использован существующий `ProductGallery`.
- Product Tour: без изменений; документ уже описывает управление галереей товара.
- Ограничения: Playwright выполнил целевой тест без падения, но процесс пришлось остановить вручную
  из-за зависшего завершения локального dev web server; Browser plugin недоступен.

## Task 81 — Оптимизация E2E-набора

- Результат: Playwright-набор сокращён с 47 до 26 сценариев; удалены дублирующие проверки статического
  контента, точной CSS-геометрии, preview-сохранения и повторяющиеся responsive-сценарии. Сохранены
  критические потоки покупки, корзины, checkout, авторизации, каталога, admin CRUD, статусов заказа и
  клавиатурной доступности.
- Файлы: `tests/e2e/**`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 60 Jest-тестов и production build прошли; 26 Playwright-тестов
  выполнились без падений через `http://localhost:3000`.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: штатный `127.0.0.1` блокируется Next.js dev-origin; после успешного выполнения сценариев
  Playwright пришлось остановить вручную из-за зависшего завершения dev web server. Browser plugin
  недоступен.

## Task 82 — Отдельный visual E2E-набор

- Результат: добавлен отдельный набор из шести `@visual`-сценариев для геометрии desktop-header,
  мобильного поиска, cart drawer, checkout и hero-блоков About/Login; основной E2E-запуск исключает
  visual-тесты. Regression-набор выявил и защитил исправление desktop-смещения hero-блоков после
  увеличения высоты header с 80 до 128 пикселей. Стабилизированы ожидание обновления корзины и выбор
  error summary checkout; Playwright переведён на один worker из-за потери ранних hydration-событий
  при параллельной нагрузке на локальный Next.js dev server.
- Файлы: `package.json`, `tests/e2e/visual-regression.spec.ts`, `tests/e2e/cart.spec.ts`,
  `tests/e2e/checkout.spec.ts`, `playwright.config.ts`, `src/styles/globals.css`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 60 Jest-тестов, production build и 6 visual E2E прошли;
  два нестабильных основных E2E воспроизведены только параллельно и прошли изолированно до
  стабилизации ожиданий.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: Browser plugin недоступен; Playwright запускается через `http://localhost:3000`, потому
  что Next.js блокирует dev-ресурсы для штатного `127.0.0.1`.

## Task 83 — Разрешённый Playwright dev-origin

- Результат: Next.js dev-server разрешает дополнительный origin `127.0.0.1`, используемый штатным
  `baseURL` Playwright; предупреждения и блокировка dev-ресурсов устранены без расширения production-доступа.
- Файлы: `next.config.ts`, `docs/progress.md`.
- Проверки: Prettier, ESLint и TypeScript прошли; интерактивный Playwright-тест header через штатный
  `http://127.0.0.1:3000` прошёл без предупреждений `Blocked cross-origin request`.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: после успешного теста процесс Playwright снова пришлось остановить вручную из-за
  зависшего завершения локального dev web server; `next-env.d.ts` изменён самим Next.js dev и не
  включён в изменение задачи.

## Task 84 — Инструкция по ручному запуску тестов

- Результат: добавлена отдельная инструкция для ручного запуска lint, typecheck, Jest, build,
  основных и visual Playwright-тестов; описаны точечный, headed и debug-запуски, HTML-отчёт,
  переопределение `PLAYWRIGHT_BASE_URL` и диагностика частых ошибок.
- Файлы: `docs/TESTING.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` прошли.
- Переменные окружения: нет; документировано временное использование `PLAYWRIGHT_BASE_URL`.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: команды в инструкции соответствуют Windows PowerShell и текущей конфигурации проекта.

## Task 85 — Правило добавления E2E

- Результат: корневые правила проекта явно требуют создавать E2E для новой функциональности только
  при добавлении или существенном изменении критического сквозного сценария и только после
  отдельного явного разрешения пользователя для каждого нового E2E.
- Файлы: `AGENTS.md`, `docs/progress.md`.
- Проверки: Prettier и `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: `.codex/rules/testing.md` доступен для чтения, но patch-механизм не разрешил запись
  через путь, определённый средой как reparse point; эквивалентное обязательное правило добавлено в
  корневой `AGENTS.md`, который имеет приоритет для всего проекта.

## Task 86 — Галерея кресла Aster

- Результат: кресло Aster получило галерею из девяти изображений; при проверке сохранённых данных
  восстановлены действующие slug, размеры, пути изображений и содержательные alt-тексты кресла Forma,
  случайно заменённые промежуточными значениями.
- Файлы: `src/modules/catalog/mock-data.ts`, `public/images/armchairs/aster-armchair/**`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 60 Jest-тестов, декодирование девяти PNG Aster и production
  build прошли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: E2E не запускались; новый критический сквозной сценарий не добавлялся.

## Task 87 — Столы для гостиной

- Результат: пункт «Столы для гостиной» в панели каталога ведёт на отдельную страницу
  `/catalog/living-room-tables`; на странице размещены описание категории и ровно три карточки Riva,
  Orsa и Plano с переходами на страницы товаров и добавлением в корзину.
- Файлы: `src/app/(store)/catalog/living-room-tables/page.tsx`,
  `src/app/(store)/catalog/living-room-tables/page.test.tsx`,
  `src/components/layout/catalog-menu-route.test.tsx`, `src/components/layout/catalog-menu.tsx`,
  `src/modules/catalog/mock-data.ts`, `src/styles/globals.css`, `docs/ProductTour.md`,
  `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, 62 Jest-теста и production build через webpack — успешно;
  новый маршрут статически сгенерирован.
- Переменные окружения: нет.
- Архитектура: без изменений; использованы существующие `ProductPreview`, mock-каталог и общий
  динамический маршрут `/product/[id]`.
- Product Tour: добавлена карта категории `/catalog/living-room-tables`.
- Ограничения: Browser plugin недоступен; E2E не запускались и не изменялись, поскольку новый
  критический сквозной сценарий не добавлялся. Стандартный Turbopack build в изолированном worktree
  не поддержал junction на общие зависимости, поэтому production build проверен штатным webpack.

## Task 88 — Новые изображения столов для гостиной

- Результат: для Riva, Orsa и Plano сгенерированы отдельные интерьерные фотографии в едином
  каталожном стиле; карточки и страницы товаров получили новые изображения, расширенные описания и
  уточнённые alt-тексты.
- Файлы: `src/modules/catalog/mock-data.ts`, `public/images/living-room-tables/**`,
  `docs/progress.md`.
- Проверки: ESLint, TypeScript, 62 Jest-теста, production build через webpack и `git diff --check` —
  успешно.
- Переменные окружения: нет.
- Архитектура и Product Tour: без изменений.
- Ограничения: E2E не запускались и не изменялись; пользовательский сценарий не менялся.

## Task 89 — Гостевое избранное

- Результат: добавлены доступные кнопки-сердца на общие карточки товаров, ссылки на избранное в
  desktop- и mobile-навигацию, публичная страница `/favorites` с актуальными карточками и пустым
  состоянием, а также валидируемое Zustand-хранилище упорядоченных ID в localStorage. Неизвестные ID
  безопасно игнорируются, состояние гидратации не создаёт расхождение первого рендера.
- Файлы: `src/modules/favorites/**`, `src/app/(store)/favorites/page.tsx`,
  `src/modules/catalog/components/product-preview.tsx`, `src/components/layout/header.tsx`,
  `src/components/layout/mobile-navigation.tsx`, `src/styles/globals.css`, `docs/architecture.md`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: целевые 7 Jest-тестов, полный набор из 69 Jest-тестов, ESLint, TypeScript, production
  build через webpack, целевой Prettier check и `git diff --check` прошли; Playwright QA на
  1440×1000 и 390×844 подтвердила добавление, восстановление, удаление, пустое состояние и отсутствие
  ошибок консоли.
- Переменные окружения: нет.
- Архитектура: в `docs/architecture.md` зафиксирован гостевой favorites-модуль и будущая серверная
  синхронизация с PostgreSQL после входа.
- Product Tour: обновлены разделы навигации и публичных страниц.
- Ограничения: избранное пока хранится только в текущем браузере и не связано с preview-авторизацией;
  Browser plugin недоступен, поэтому визуальная QA выполнена обычным Playwright; глобальный
  `npm run format:check` находит ранее существовавшие несоответствия в служебных каталогах и чужих
  worktree, файлы задачи проверены адресно; E2E-файлы не изменялись.

## Task 90 — Компактная кнопка избранного

- Результат: видимый круг и иконка сердца на товарных карточках уменьшены на 20%, при этом доступная
  область нажатия сохранена размером 44×44 пикселя.
- Файлы: `src/styles/globals.css`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, Jest, production build и `git diff --check` прошли;
  Playwright QA подтвердила размеры 35,2×35,2 пикселя для круга, 19,2×19,2 пикселя для иконки,
  переключение состояния и отсутствие ошибок консоли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: Browser plugin недоступен, поэтому визуальная QA выполнена обычным Playwright;
  существующие E2E-файлы не изменялись.

## Task 91 — Избранное на странице товара

- Результат: на странице конкретного товара рядом с добавлением в корзину появилась адаптивная
  кнопка «В избранное» / «В избранном». Она использует общее гостевое Zustand-хранилище, сохраняет
  безопасное состояние гидратации и доступные `aria-label` и `aria-pressed`.
- Файлы: `src/modules/catalog/components/product-configurator.tsx`,
  `src/modules/favorites/components/favorite-button.tsx`,
  `src/modules/favorites/components/favorite-button-detail.test.tsx`, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: адресный Prettier, ESLint, TypeScript, полный набор из 70 Jest-тестов, production build
  и `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений; повторно использованы существующий favorites-модуль и его хранилище.
- Product Tour: обновлены разделы избранного и страницы товара.
- Ограничения: Browser plugin недоступен; существующие E2E-файлы не изменялись. Глобальный
  Prettier-check по-прежнему отмечает ранее существовавшие несоответствия в служебных каталогах и
  старых worktree, поэтому файлы задачи проверены адресно.

## Task 92 — Сердце поверх фотографии товара

- Результат: на странице конкретного товара кнопка избранного перенесена из блока действий в правый
  верхний угол главной фотографии и оформлена тем же компактным сердцем, что и карточки каталога.
  Состояние, гидратационная безопасность, `aria-label`, `aria-pressed` и область нажатия 44×44
  пикселя сохранены.
- Файлы: `src/app/(store)/product/[id]/page.tsx`,
  `src/modules/catalog/components/product-configurator.tsx`,
  `src/modules/catalog/components/product-gallery.tsx`,
  `src/modules/favorites/components/favorite-button.tsx`,
  `src/modules/favorites/components/product-gallery-favorite.test.tsx`, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: целевые 4 Jest-теста, полный набор из 70 Jest-тестов, ESLint, TypeScript, адресный
  Prettier, production build и `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений; используется существующий favorites-модуль.
- Product Tour: уточнено расположение кнопки избранного на странице товара.
- Ограничения: Browser plugin недоступен; существующие E2E-файлы не изменялись.

## Task 93 — Прозрачное оформление избранного

- Результат: у кнопок-сердец на всех карточках каталога и на странице товара удалены белая подложка
  и тень, сохранено лёгкое размытие фотографии под прозрачным кругом. После добавления товара в
  избранное сердце полностью заполняется основным почти чёрным цветом интерфейса.
- Файлы: `src/styles/globals.css`, `docs/progress.md`.
- Проверки: адресный Prettier, ESLint, TypeScript, полный набор из 70 Jest-тестов, production build
  и `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений; пользовательский сценарий и расположение элементов не менялись.
- Ограничения: существующие E2E-файлы не изменялись.

## Task 94 — Полупрозрачный фон избранного

- Результат: белая круглая подложка кнопок-сердец возвращена с прозрачностью 70%; лёгкое размытие
  фотографии и чёрное заполнение выбранного сердца сохранены.
- Файлы: `src/styles/globals.css`, `docs/progress.md`.
- Проверки: Prettier, ESLint, TypeScript, полный набор из 70 Jest-тестов, production build и
  `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: существующие E2E-файлы не изменялись.

## Task 95 — Адаптивный футер публичного магазина

- Результат: создан переиспользуемый тёмный `SiteFooter` с четырьмя смысловыми desktop-колонками,
  адаптивной сеткой 4→2→1, контактами из `storeProfile`, доступными внешними кнопками Telegram и
  ВКонтакте, нижним разделителем и кнопкой плавной прокрутки наверх с учётом
  `prefers-reduced-motion`. Футер подключён только к публичному store layout; отсутствующие
  покупательские разделы помечены как готовящиеся без создания битых маршрутов.
- Файлы: `src/components/layout/site-footer.tsx`,
  `src/components/layout/scroll-to-top-button.tsx`, `src/components/layout/site-footer.test.tsx`,
  `src/app/(store)/layout.tsx`, `src/app/(store)/about/page.tsx`, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: адресный Prettier, ESLint, TypeScript, 71 Jest-тест, production build и
  `git diff --check` прошли. Playwright QA на 1536, 820 и 390 пикселях подтвердила сетку 4→2→1,
  отсутствие горизонтального переполнения и работу кнопки «Наверх»; desktop, tablet и mobile
  рендеры сверены с созданным дизайн-концептом через `view_image`.
- Переменные окружения: нет.
- Архитектура: без изменений; добавлены layout-компоненты в существующую публичную оболочку.
- Product Tour: добавлен раздел общего футера публичного сайта.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнена обычным Playwright;
  существующие E2E-файлы не изменялись. Покупательские информационные страницы пока отсутствуют.

## Task 96 — Социальные сети вместо предфутерного CTA

- Результат: с главной страницы удалён отдельный контактный CTA «Давайте создадим пространство
  вместе» и его неиспользуемые стили. В ряд социальных кнопок общего футера добавлен Instagram с
  доступным названием, безопасной ссылкой-заглушкой и локальной SVG-иконкой, согласованной с
  Telegram и ВКонтакте.
- Файлы: `src/app/(store)/page.tsx`, `src/app/(store)/page.test.tsx`,
  `src/components/layout/site-footer.tsx`, `src/components/layout/site-footer.test.tsx`,
  `src/styles/globals.css`, `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: адресный Prettier, ESLint, TypeScript, 71 Jest-тест, production build и
  `git diff --check` прошли. Playwright QA на 1536 и 390 пикселях подтвердила отсутствие CTA, три
  социальные кнопки в одном ряду и отсутствие горизонтального переполнения; оба рендера проверены
  через `view_image`.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: удалён контактный CTA из состава главной, к соцсетям футера добавлен Instagram.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнена обычным Playwright;
  существующие E2E-файлы не изменялись.

## Task 97 — Правила изменения и ревью базы данных

- Результат: корневые правила Prisma/PostgreSQL дополнены классификацией изменений, проверкой SQL
  миграций, безопасным `expand -> migrate -> contract`, защитой от гонок, короткими транзакциями,
  обоснованными индексами и запретом `db push` в разделяемых средах; добавлен обязательный read-only
  workflow для ревью схемы, миграций и запросов.
- Файлы: `AGENTS.md`, `docs/progress.md`.
- Проверки: адресный Prettier и `git diff --check` прошли; маршрутизация и DB-review workflow вручную
  сверены с существующими skills `database-change` и `code-review`.
- Переменные окружения: нет.
- Архитектура: без изменений; уточнены правила работы агента с уже принятой Prisma/PostgreSQL
  архитектурой.
- Product Tour: без изменений.
- Ограничения: `.codex/rules/database.md` и `.agents/skills/**` не изменены, потому что обязательный
  patch-механизм среды блокирует запись в эти каталоги как reparse point; эквивалентные правила и
  DB-review workflow добавлены в приоритетный корневой `AGENTS.md`. Prisma schema и миграции пока
  отсутствуют, поэтому database-команды не запускались.

## Task 98 — План внедрения базы данных

- Результат: подготовлен детальный план реализации DB-пунктов 39–49 из основного implementation
  plan с привязкой к backend-пунктам 23–38, целевыми сущностями, инвариантами, индексами, политикой
  миграций и seed, вертикальными этапами внедрения, проверками и открытыми доменными решениями.
- Файлы: `docs/database-implementation-plan.md`, `docs/implementation-plan.md`, `docs/progress.md`.
- Проверки: Prettier для нового плана и `docs/progress.md`, а также `git diff --check` прошли;
  структура вручную сверена с пунктами 23–49 `docs/implementation-plan.md`, архитектурой, ТЗ и
  фактическими mock-контрактами.
- Переменные окружения: нет; используются только уже документированные имена без значений.
- Архитектура: существующая Prisma/PostgreSQL архитектура не изменена, план детализирует её будущее
  поэтапное внедрение.
- Product Tour: без изменений.
- Ограничения: Prisma schema, миграции и подключение PostgreSQL намеренно не создавались; до начала
  реализации необходимо согласовать варианты товара, статусы заказа, Auth.js scope, DTO денег и
  целевую PostgreSQL-среду. Существующий `docs/implementation-plan.md` целиком не соответствует
  текущему Prettier; ради одной ссылки файл не переформатировался полностью.

## Task 99 — Единый план реализации

- Результат: основной implementation plan объединён с детализацией базы данных в один
  последовательный план из 85 пунктов; задачи БД, backend, интеграции и тестирования разделены, а
  дублирующий DB-план удалён. Зафиксированы пять статусов заказа, простые товарные опции без SKU на
  первом этапе, decimal-строка для денежных DTO и поэтапное внедрение Auth.js.
- Файлы: `docs/implementation-plan.md`, `docs/database-implementation-plan.md`,
  `docs/architecture.md`, `.codex/rules/testing.md`, `docs/progress.md`.
- Проверки: адресный Prettier и `git diff --check`.
- Переменные окружения: нет.
- Архитектура: `docs/architecture.md` синхронизирован с пятью статусами заказа и допустимыми
  переходами.
- Product Tour: без изменений; фактические пользовательские функции и маршруты не менялись.
- Ограничения: план не реализует Prisma schema, миграции или backend; PostgreSQL-платформа и хостинг
  остаются отдельными решениями будущего этапа.

## Task 100 — Публичная страница новинок

- Результат: добавлен маршрут `/new` с metadata, выборкой активных новинок из общего mock-каталога,
  сортировкой по началу периода, текстовыми метками карточек и доступным пустым состоянием; desktop-
  и mobile-навигация ведут на новый маршрут.
- Файлы: `src/app/(store)/new/page.tsx`, `src/modules/catalog/new-arrivals.ts`,
  `src/modules/catalog/types.ts`, `src/modules/catalog/mock-data.ts`,
  `src/modules/catalog/components/product-preview.tsx`, layout-навигация, стили, Jest-тесты,
  `docs/ProductTour.md`, `docs/architecture.md`, `docs/implementation-plan.md`, `docs/progress.md`.
- Проверки: ESLint, TypeScript, 33 Jest-набора (81 тест), production build, адресные Jest-тесты,
  desktop/mobile Chromium QA и `view_image` прошли; маршрут `/new` подтверждён как динамический.
- Переменные окружения: нет.
- Архитектура: mock/DTO-контракт товара расширен nullable ISO 8601 UTC-полями `newFrom` и
  `newUntil`; статус вычисляется чистой функцией по включительному интервалу и не связан с
  `createdAt`/`updatedAt`.
- Product Tour: добавлены маршрут `/new`, пользовательский сценарий, навигация и карта ключевых
  файлов.
- Ограничения: Prisma/backend ещё не подключены; управление периодом в админке намеренно отложено до
  постоянного хранения и должно включать переключатель, даты начала/окончания и рекомендуемое
  окончание через 30 дней.

## Task 101 — Публичная страница акций

- Результат: добавлен маршрут `/sale` с редакционным hero, периодом действия, сеткой акционных
  товаров, доступным empty state и ссылками «Акции» в desktop/mobile-навигации; общая карточка товара
  поддерживает исходную и текущую цену без изменения обычных каталожных карточек.
- Файлы: `src/app/(store)/sale/page.tsx`, `src/modules/promotions`,
  `src/modules/catalog/components/product-preview.tsx`, layout-навигация, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/architecture.md`, `docs/progress.md`.
- Проверки: 7 адресных unit-тестов, ESLint, TypeScript и production build прошли; desktop 1440×1100
  и mobile 390×844 проверены headless Chrome и `view_image`. Полный Jest: 87 тестов прошли, один
  существующий тест `/new` ожидает старую ссылку «Акции» на `/catalog` и требует отдельного разрешения
  на обновление.
- Переменные окружения: нет.
- Архитектура: добавлен независимый mock-домен promotions с чистым включительным периодом,
  процентным расчётом и детерминированным разрешением конфликта; production pricing остаётся
  обязательной серверной ответственностью со снимком цены и акции в заказе.
- Product Tour: добавлены маршрут `/sale`, сценарий страницы акций и карта ключевых файлов.
- Ограничения: Prisma, API, административное управление акциями и серверный pricing engine не
  реализованы; Playwright/E2E не запускались и не изменялись по прямому ограничению пользователя.

## Task 102 — Слайдеры и полноэкранные галереи товаров

- Результат: общий `ProductPreview` использует динамический `product.gallery` с fallback на
  `product.image`, ручными циклическими стрелками, свайпом и счётчиком; карточки и страница товара
  открывают переиспользуемую полноэкранную галерею на текущем кадре с клавиатурой, блокировкой
  фоновой прокрутки, focus trap и возвратом фокуса. Стрелки, счётчики и полноэкранный крестик получили
  компактное полупрозрачное оформление в стиле кнопки избранного без уменьшения доступной зоны нажатия.
- Файлы: компоненты и тесты галереи в `src/modules/catalog/components`, общий navigation hook в
  `src/modules/catalog/hooks/use-gallery-navigation.ts`, `src/styles/globals.css`, `docs/progress.md`.
- Проверки: адресные component-тесты (5), ESLint, TypeScript, production build и `git diff --check`
  прошли; desktop/mobile QA выполнен через Chrome DevTools без ошибок Console. Полный Jest: 90 из 91
  теста прошли, существующий `src/app/(store)/new/page.test.tsx` ожидает устаревшую ссылку «Акции» на
  `/catalog` вместо фактического `/sale`.
- Переменные окружения: нет.
- Архитектура: API, схема данных и административная модель изображений не изменялись; навигация по
  галерее и полноэкранный viewer переиспользуются обеими публичными поверхностями.
- Product Tour: без изменений; существующие маршруты и пользовательские сценарии не менялись.
- Ограничения: autoplay отсутствует; E2E-файлы не изменялись и E2E не запускались; существующий
  устаревший тест страницы новинок не исправлялся без разрешения пользователя.

## Task 103 — Редакционная витрина каталога

- Результат: `/catalog` переработан в самостоятельную витрину с новым вводным блоком, адаптивной
  мозаикой десяти кликабельных категорий и разделом «Все предметы»; общий запрос переключён на
  полный `allProducts`, а desktop/mobile-поведение панели каталога сохранено.
- Файлы: `src/app/(store)/catalog/page.tsx`, компоненты и запросы `src/modules/catalog`,
  `src/styles/globals.css`, `public/images/catalog-categories/`, `docs/ProductTour.md`,
  `docs/progress.md`.
- Проверки: новый component-тест, ESLint, TypeScript и production build прошли; desktop 1440×900,
  tablet 768×900 и mobile 390×844 проверены проектным Playwright без ошибок Console и
  горизонтального переполнения; focus, reduced motion и переход на `/catalog/armchairs` подтверждены.
- Переменные окружения: нет.
- Архитектура: направление `app -> modules/catalog` и Server Component для мозаики сохранены;
  клиентская граница осталась только в существующем query-grid.
- Product Tour: обновлены карта `/catalog`, состав страницы, источники категорий и полного
  ассортимента, а также переходы панели каталога.
- Ограничения: специализированный Browser plugin недоступен, поэтому rendered QA выполнен обычным
  Playwright; существующие E2E не изменялись.

## Task 104 — Уникальные товары общего каталога

- Результат: устранено повторное включение `forma-armchair` в `allProducts`; React больше не получает
  две карточки с одинаковым ключом, а уникальность `id` и `slug` защищена regression-тестом.
- Файлы: `src/modules/catalog/mock-data.ts`, `src/modules/catalog/mock-data.test.ts`,
  `docs/progress.md`.
- Проверки: адресный Jest-тест, ESLint, TypeScript, production build и `git diff --check` прошли.
  Полный Jest: 91 из 93 тестов прошли; два существующих теста ожидают устаревшие заголовок каталога
  и ссылку «Акции» и не изменялись без разрешения пользователя.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений.
- Ограничения: существующие E2E не изменялись и не запускались.

## Task 105 — Постраничная карусель каталога

- Результат: раздел товаров `/catalog` ограничен страницами по 12 карточек на desktop/tablet и по 5
  на mobile `< 600px`; добавлены ручные стрелки, вычисляемые индикаторы, доступный live-статус и
  защищённый горизонтальный свайп без autoplay. Параметр `?page=` канонизируется, синхронизирован с
  Back/Forward, а при смене breakpoint новая страница сохраняет первый видимый товар.
- Файлы: `src/app/(store)/catalog/page.tsx`,
  `src/app/(store)/catalog/catalog.test.tsx`,
  `src/modules/catalog/components/catalog-query-grid.tsx`,
  `src/modules/catalog/components/catalog-query-grid.test.tsx`, `src/styles/globals.css`,
  `docs/ProductTour.md`, `docs/progress.md`.
- Проверки: 12 адресных Jest-тестов, ESLint, TypeScript, production build и `git diff --check`
  прошли. Chromium QA на 1440×1000 и 390×844 подтвердила сетку 4×3, мобильные 5 карточек,
  стрелки, фокус, URL/Back, clamp, resize, swipe и отсутствие horizontal overflow. Полный Jest:
  99 из 100 тестов прошли; несвязанный устаревший тест `/new` по-прежнему ожидает ссылку «Акции» на
  `/catalog` вместо фактического `/sale`.
- Переменные окружения: нет.
- Архитектура: публичный контракт данных не изменён; управление страницей изолировано внутри
  query-grid, поэтому будущая серверная пагинация сможет заменить источник и slice без замены
  навигационного UI.
- Product Tour: описание `/catalog` дополнено адаптивной пагинацией, URL и swipe.
- Ограничения: Browser plugin недоступен, поэтому rendered QA выполнен обычным Playwright;
  существующие E2E-файлы не изменялись. В dev Console остаётся несвязанное предупреждение Next Image
  LCP для обложки категории.

## Task 106 — Обновлённые обложки категорий каталога

- Результат: по предоставленному визуальному референсу заново сгенерированы фотореалистичные
  интерьерные обложки для пуфиков, кресел, диванов, обеденных столов и стульев; основной набор
  заменён в витрине, второй самостоятельный вариант стульев сохранён рядом для последующего выбора.
- Файлы: `public/images/catalog-categories/poufs.png`,
  `public/images/catalog-categories/armchairs.png`, `public/images/catalog-categories/sofas.png`,
  `public/images/catalog-categories/dining-tables.png`,
  `public/images/catalog-categories/chairs.png`,
  `public/images/catalog-categories/chairs-v2.png`, `docs/progress.md`.
- Проверки: изображения визуально проверены после генерации; связанный component-тест витрины и
  `git diff --check` прошли.
- Переменные окружения: нет.
- Архитектура: без изменений.
- Product Tour: без изменений; пути основных обложек сохранены.
- Ограничения: `chairs-v2.png` сохранён как дополнительный вариант и пока не подключён в UI.
