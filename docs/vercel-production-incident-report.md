# Отчёт о восстановлении production-сайта на Vercel

## Краткий итог

Production-сайт Virtual Space не работал из-за нескольких последовательно выявленных проблем в
сборке, конфигурации окружения, release pipeline и начальном состоянии PostgreSQL. Проблемы были
устранены поэтапно. На момент первоначального составления отчёта сайт открывался, подключение к Neon
и миграции работали, обязательные настройки магазина были созданы, но демонстрационные товары ещё не
были загружены в production-базу. Последующее исправление добавило безопасный catalog bootstrap в
release pipeline; для фактической загрузки требуется выполнить новый Production release.

## Выявленные проблемы и выполненные действия

### 1. Prisma Client не создавался при сборке

Vercel собирал приложение без гарантированно сгенерированного Prisma Client. Из-за этого серверный
код не мог надёжно обращаться к PostgreSQL.

Выполнено:

- добавлен автоматический `prisma generate` после установки зависимостей;
- добавлена генерация перед TypeScript-проверкой и production build;
- Prisma-конфигурация адаптирована для генерации клиента без подключения к базе;
- в production workflow добавлена явная генерация после загрузки окружения Vercel.

### 2. Neon не был полностью подключён к проекту Vercel

Приложению не хватало корректных строк подключения к PostgreSQL.

Выполнено:

- Neon подключён к проекту Vercel;
- созданы `DATABASE_URL` и `DATABASE_URL_UNPOOLED`;
- переменные назначены окружениям Production и Preview.

### 3. Auth.js не доверял домену deployment

Runtime-логи содержали ошибку:

```text
UntrustedHost: Host must be trusted
```

Выполнено:

- добавлено `AUTH_TRUST_HOST=true`;
- основной адрес приложения задан через
  `AUTH_URL=https://virtual-space-tau.vercel.app`.

### 4. Auth.js не видел секрет

Runtime-логи содержали ошибку:

```text
MissingSecret: Please define a secret
```

Выполнено:

- `AUTH_SECRET` создан в Vercel для нужных окружений;
- конфигурация Auth.js дополнена явным server-only параметром `secret: process.env.AUTH_SECRET`;
- значение секрета не сохранялось в Git и не выводилось в логи.

### 5. GitHub Actions не мог обращаться к Vercel

Первый production workflow завершался ошибкой об отсутствующем значении `--token`.

Выполнено:

- созданы GitHub Environments `release-preview` и `production`;
- в оба окружения добавлены `VERCEL_TOKEN`, `VERCEL_ORG_ID` и `VERCEL_PROJECT_ID`.

### 6. В release job отсутствовал ESLint

Job-level `NODE_ENV=production` заставлял npm исключать devDependencies. Release preflight
останавливался с ошибкой:

```text
eslint: not found
```

Выполнено:

- установка зависимостей в обоих release jobs изменена на `npm ci --include=dev`.

### 7. Jest запускался с `NODE_ENV=production`

React загружал production-сборку, в которой тестовый `act()` недоступен. В результате component-тесты
падали с ошибкой:

```text
TypeError: (0, _react.act) is not a function
```

Выполнено:

- Jest вынесен в отдельный шаг workflow;
- для этого шага явно установлено `NODE_ENV=test`;
- подтверждено прохождение 96 test suites и 297 тестов.

### 8. В production-базе отсутствовали таблицы

После первого успешного Vercel deployment Prisma возвращал ошибку:

```text
The table public.StoreSettings does not exist in the current database
```

Причиной было отсутствие применённых миграций в новой базе Neon.

Выполнено:

- настроен защищённый ручной workflow `Production release`;
- один immutable Git artifact проверяется в Preview;
- миграции сначала проверяются на Preview, затем применяются к Production;
- после миграции разворачивается тот же проверенный commit SHA.

### 9. В базе отсутствовали обязательные настройки магазина

После создания таблиц главная страница завершалась с ошибкой:

```text
Primary public store settings are not configured
```

Обычный seed намеренно запрещён в Production, поэтому новая база не содержала обязательную запись
`StoreSettings.primary`.

Выполнено:

- добавлена отдельная data-only migration;
- миграция создаёт `StoreSettings.primary` только при отсутствии записи;
- используется `ON CONFLICT ("key") DO NOTHING`, поэтому существующие операторские настройки не
  перезаписываются;
- миграция успешно прошла через новый Production release.

## Итоговое состояние

- production deployment выполняется успешно;
- Vercel подключён к Neon;
- Prisma Client генерируется автоматически;
- структура базы и обязательные настройки магазина созданы;
- Preview и Production release jobs проходят;
- lint, TypeScript, Jest и production build проходят;
- сайт открывается по адресу `https://virtual-space-tau.vercel.app`.

## Почему каталог пока пуст

Категории и товары из демонстрационного набора репозитория не загружались в Production. Migration
workflow намеренно не запускает общий seed, чтобы тестовые данные не могли случайно перезаписать
реальные данные магазина.

Для полного соответствия содержимому репозитория реализован отдельный повторяемый catalog bootstrap.
Он добавляет отсутствующие категории, товары, изображения, характеристики и варианты, не удаляя и
не перезаписывая уже существующие операторские данные. Bootstrap применяется следующим Production
release после Prisma migrations.

## Связанные исправления

- `a7c4d4b` — надёжная генерация Prisma Client;
- `3b06f6b` — установка release-инструментов из devDependencies;
- `50d4762` — запуск Jest в тестовом окружении;
- `775e0a9` — начальная настройка `StoreSettings.primary` и явный Auth.js secret.
