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
