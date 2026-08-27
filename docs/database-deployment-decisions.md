# PostgreSQL и развёртывание первого DB-релиза

## 1. Назначение

Документ раскрывает пункт 24 из `docs/implementation-plan.md` и фиксирует платформу PostgreSQL,
изоляцию local/preview/production, connection pooling, доступ к секретам и release-процесс миграций.

Это подготовительное архитектурное решение. Оно не создаёт Neon/Vercel-ресурсы, не подключает
production-базу и не означает, что Prisma schema или миграции уже реализованы.

## 2. Принятое решение

- Next.js-приложение развёртывается на **Vercel**.
- Управляемый PostgreSQL размещается в **Neon** через Neon-managed Vercel Integration.
- Регион Neon выбирается максимально близко к региону Vercel Function, обслуживающему запросы к БД;
  конкретный регион фиксируется при создании ресурсов после проверки доступности для выбранного
  аккаунта и требований к размещению данных.
- Production использует долгоживущую защищённую Neon-ветку. Каждый preview deployment получает
  отдельную временную Neon-ветку. Local development использует отдельную dev-ветку, а не production.
- Приложение подключается через pooled URL; Prisma CLI, миграции, backup/restore и другое
  session-dependent администрирование используют direct URL.

Vercel Postgres как отдельный продукт не выбирается: новые PostgreSQL-базы подключаются через
Marketplace, а прежний Vercel Postgres был перенесён на Neon. Self-hosted PostgreSQL, Supabase,
Railway и Render не дают текущему Vercel-first проекту преимущества, оправдывающего дополнительную
операционную поверхность. Выбор провайдера можно пересмотреть до хранения production-данных, если
изменятся требования к региону, бюджету, SLA или юридическому размещению данных.

## 3. Матрица окружений

| Среда      | Приложение                   | PostgreSQL                                                    | Данные и жизненный цикл                                                                                  |
| ---------- | ---------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Local      | `npm run dev` на Node.js 24+ | отдельная Neon-ветка `dev/<developer-or-feature>`             | только тестовые/seed-данные; production credentials локально не выдаются                                 |
| Preview    | Vercel Preview на PR/ветку   | отдельная ephemeral Neon-ветка `preview/pr-<number>-<branch>` | создаётся до проверки миграции, получает собственные URLs, удаляется после закрытия PR по TTL/интеграции |
| Production | Vercel Production из `main`  | защищённая Neon-ветка `production`                            | реальные данные; запрет reset, auto-seed и использования из preview/local                                |

Preview не должен автоматически получать необработанную копию production-данных. До появления
процесса маскирования preview создаётся от безопасной непроизводственной baseline-ветки и заполняется
повторяемым seed. Если для диагностики позже потребуются реалистичные данные, источником может быть
только предварительно анонимизированная ветка с отдельно утверждёнными правилами доступа и retention.

## 4. Соединения и pooling

Neon выдаёт два server-only секрета:

```dotenv
DATABASE_URL=             # pooled endpoint, hostname содержит -pooler
DATABASE_URL_UNPOOLED=    # direct endpoint для release/admin tooling
```

Правила использования:

1. `DATABASE_URL` использует PrismaClient через `@prisma/adapter-pg` для всех runtime-запросов Vercel
   и local/preview приложения. В каждой среде URL указывает только на её Neon-ветку.
2. `DATABASE_URL_UNPOOLED` используется `prisma.config.ts` для `prisma migrate deploy`, разработки
   миграций, introspection, backup/restore и Prisma Studio. Runtime-код его не читает.
3. PrismaClient остаётся единым server-only singleton на процесс/warm instance. Нельзя создавать
   новый client на каждый запрос или подключать direct URL к serverless runtime.
4. Neon PgBouncer работает в transaction mode. Код не полагается на сохранение session-level
   `SET`, временных таблиц, `LISTEN/NOTIFY`, session advisory locks или cursors между транзакциями.
5. Транзакции должны быть короткими и не содержать сетевых вызовов. Исчерпание пула, время ожидания,
   число соединений и медленные запросы контролируются метриками Neon; размер compute/pool меняется
   по измеренной нагрузке, а не предварительно.
6. Оба URL обязаны требовать TLS согласно строкам подключения Neon. Параметры URL не собираются из
   отдельных фрагментов в коде и не логируются.

Хотя актуальные Prisma и Neon допускают часть CLI-операций через pooler, для release-процесса выбран
direct endpoint: это отделяет ограниченный административный доступ от массового serverless-трафика и
не зависит от session-ограничений transaction pooling.

## 5. Секреты и права доступа

- Значения хранятся только в Neon/Vercel secret storage или в локальном gitignored `.env.local`;
  репозиторий содержит лишь пустые имена в `.env.example`.
- `DATABASE_URL` доступен runtime-окружению соответствующего Vercel deployment. Он не имеет
  `NEXT_PUBLIC_`-префикса и никогда не передаётся в Client Components, ответы или логи.
- `DATABASE_URL_UNPOOLED` доступен только локальному доверенному оператору и отдельному migration job.
  Обычным Preview/Production Functions direct credential не требуется.
- Production и non-production используют разные credentials. Preview credential ограничен своей
  ephemeral-веткой; закрытие PR отзывает доступ удалением ветки/endpoint.
- Доступ людей выдаётся по принципу минимальных привилегий через Neon/Vercel accounts, с MFA для
  владельцев production и аудитом участников. Строки подключения ротируются после подозрения на
  раскрытие или изменения состава привилегированной команды.
- CI не печатает env, строки команд с URL, Prisma debug output с credentials и полные ошибки
  подключения. Проверка env сообщает только имя отсутствующей переменной.

## 6. Release-процесс миграций

Миграция является отдельным одноразовым release job и не запускается во время `next build`, старта
приложения, Server Action, Route Handler или serverless cold start.

### Pull request / preview

1. Создать из безопасной baseline отдельную Neon preview-ветку и внедрить в deployment её pooled и
   direct URLs.
2. Установить зависимости через `npm ci`; выполнить `prisma validate` и `prisma generate`.
3. Прочитать SQL новой миграции и проверить `DROP`, сужение типа, table rewrite, `NOT NULL` без
   backfill, длительные блокировки, повторный запуск и совместимость старого/нового приложения.
4. Одноразово выполнить `prisma migrate deploy` через `DATABASE_URL_UNPOOLED` только на preview-ветке.
5. Выполнить тесты и сборку приложения против preview; seed запускать только явной отдельной командой.

### Production

1. До релиза подтвердить backup/restore или точку восстановления и успешную проверку той же
   неизменённой миграции на preview/непроизводственной копии.
2. Остановить rollout при failed checks, drift, unresolved failed migration или отсутствии direct
   production credential у migration job.
3. Выполнить ровно один `prisma migrate deploy` с immutable commit/artifact через
   `DATABASE_URL_UNPOOLED`; job не принимает запросы пользователей и не запускает seed.
4. После успеха развернуть совместимую версию приложения и выполнить smoke-проверку. При ошибке
   приложения откатить код только если схема обратно совместима; миграцию не откатывать вручную.
5. Исправлять ошибку forward-fix миграцией. Для несовместимых изменений использовать отдельные
   релизы `expand -> migrate/backfill -> contract`; destructive contract требует отдельного
   подтверждения после переключения всех потребителей.

Одновременные production migration jobs запрещены. CI/CD должен сериализовать их через один
environment lock/concurrency group. `prisma migrate dev`, `prisma db push`, reset и автоматический
seed в production запрещены.

## 7. Критерии соблюдения

- local, каждый preview и production имеют изолированные Neon-ветки и credentials;
- runtime читает pooled `DATABASE_URL`, а release job — direct `DATABASE_URL_UNPOOLED`;
- preview/local не имеют production credentials и не содержат немаскированные production-данные;
- миграция проверена на preview и выполняется один раз до production rollout;
- cold start, build и обычный runtime никогда не применяют миграции;
- backup/restore, serialisation migration jobs и forward-fix определены до первого production deploy;
- секреты не попадают в Git, клиентский bundle, логи и deployment artifacts.

## 8. Официальные источники

- [Vercel: Postgres on Vercel](https://vercel.com/docs/postgres)
- [Vercel: deployment environments](https://vercel.com/docs/deployments/environments)
- [Vercel: environment variables](https://vercel.com/docs/environment-variables)
- [Neon: connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon: database branching workflow](https://neon.com/docs/get-started-with-neon/workflow-primer)
- [Neon: Vercel integration variables](https://neon.com/docs/changelog/2024-02-23)
- [Prisma: Prisma Config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

## 9. Что не входит в пункт 24

- создание аккаунтов, Neon/Vercel project, веток и credentials;
- добавление `prisma.config.ts`, schema, PrismaClient и миграций — пункт 26 и последующие пункты;
- добавление CI workflow или Vercel deployment configuration — пункт 82;
- выбор retention/backup-плана и юридического региона без фактических production-требований;
- миграция, seed, `db push`, production-запросы или изменение внешней инфраструктуры.
