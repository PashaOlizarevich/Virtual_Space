# Production operations: environment, backup and recovery

Этот runbook применяется к production-релизам Virtual Space. Он не заменяет настройки managed
backup Neon/Vercel и не разрешает выполнять операции над production без отдельного подтверждения.

## Provisioning Vercel, Neon и GitHub

Первый production-вариант использует Vercel и Neon-managed Vercel Integration. До включения workflow
ответственный за инфраструктуру обязан:

1. связать Vercel project с репозиторием, но отключить автоматический production deployment из
   `main`, чтобы rollout выполнялся только после migration job из
   `.github/workflows/production-release.yml`;
2. подключить Neon integration, назначить защищённую долгоживущую ветку production и отдельную
   непроизводственную ветку для GitHub Environment `release-preview`;
3. выбрать регионы Neon compute и Vercel Functions максимально близко друг к другу;
4. включить managed backup/PITR с доступным по тарифу retention и выполнить restore drill до первого
   релиза; фактические RPO/RTO записать в журнал инфраструктуры, а не угадывать в репозитории;
5. создать GitHub Environments `release-preview` и `production`; для `production` включить required
   reviewers, запрет self-review и разрешить deployment только из `main`;
6. запретить параллельные production release вне этого workflow и не создавать второй workflow с
   иным concurrency group для миграций.

Оба GitHub Environment содержат только deployment secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` и
`VERCEL_PROJECT_ID`, с раздельными значениями либо scope для preview и production. Runtime и database
secrets хранятся в соответствующих Vercel Environment: `DATABASE_URL` (pooled endpoint),
`DATABASE_URL_UNPOOLED` (direct endpoint), `AUTH_SECRET`, `AUTH_URL`, Cloudinary и Telegram variables
из `.env.example`. Preview/local credentials не должны иметь доступ к production. Для обоих
PostgreSQL URL обязателен TLS согласно строке подключения Neon; URL не собираются вручную из
отдельных фрагментов.

Vercel project хранит соответствующий runtime-набор переменных для Preview и Production. В build и
runtime Prisma получает только pooled `DATABASE_URL`; direct `DATABASE_URL_UNPOOLED` читается из
защищённого Vercel env-файла только release preflight, GitHub migration job и Prisma CLI, но не
клиентский bundle. Env-файл существует только на ephemeral runner и исключён из Git. Auth.js,
Cloudinary и Telegram secrets не используют `NEXT_PUBLIC_`.

## Release pipeline

Production release запускается вручную для полного lowercase SHA из `main`. Workflow:

1. проверяет, что checkout в точности соответствует SHA и является предком `origin/main`;
2. в `release-preview` устанавливает зависимости через lock-файл, выполняет preflight, Prisma
   validation/generation, migration-history check, lint, typecheck и Jest;
3. применяет миграции к изолированной preview-БД, добавляет только отсутствующие записи versioned
   демонстрационного каталога, собирает и развёртывает этот же SHA как Vercel Preview;
4. ожидает approval защищённого GitHub Environment `production`;
5. повторно проверяет SHA и production env, сериализованно применяет те же миграции через direct URL,
   добавляет только отсутствующие записи каталога, затем собирает и развёртывает production artifact
   через Vercel CLI.

Concurrency `production-release` допускает не более одного production rollout. Ожидающий release не
отменяет выполняющийся. Vercel CLI зафиксирован по версии, GitHub Actions — по immutable commit SHA.
После обновления версии CLI или Actions требуется отдельный review и обычные проверки проекта.

Workflow намеренно не выполняет общий seed, `prisma db push`, rollback, чтение secret values или
автоматическое восстановление. Отдельный catalog bootstrap создаёт категории при отсутствии и
полностью создаёт товар с дочерними записями только тогда, когда его уникальный `slug` ещё
отсутствует; существующие операторские записи не обновляются. Перед approval оператор проверяет preview deployment, состояние
backup/PITR и результат последнего restore drill. После deployment выполняются разрешённые smoke/E2E
проверки; их автоматизация остаётся пункту 84 и не даёт разрешения изменять `tests/e2e/**`.

## Проверка окружения

Перед migration job и rollout приложения release pipeline обязан выполнить:

```text
npm run production:validate-env
```

Команда проверяет только наличие непустых обязательных переменных и выводит лишь их безопасные
имена. Значения, URL подключения, токены и ключи не журналируются. Проверяются runtime, migration,
Auth.js, Cloudinary и Telegram переменные; `OPENAI_API_KEY` не обязателен, пока AI-функции не
реализованы. Автоматическое подключение preflight к protected production pipeline относится к
пункту 82.

Seed запускается только явной командой `npm run prisma:seed`, предназначен для local/preview
подготовки и при `NODE_ENV=production` завершается до запуска TypeScript seed и создания Prisma
Client. Он не входит в `build`, `start` и migration deploy. Production-каталог и
настройки изменяются только штатными административными или отдельно спроектированными data-migration
операциями.

## Backup

До первого production-релиза владелец инфраструктуры обязан включить managed backups/PITR у
PostgreSQL-провайдера и зафиксировать срок хранения согласно тарифу и требованиям бизнеса. Перед
каждой потенциально несовместимой миграцией нужно:

1. подтвердить состояние последнего backup и доступность точки восстановления до миграции;
2. записать immutable commit SHA, имя migration job и время начала релиза;
3. проверить восстановление на отдельной непроизводственной ветке/БД с маскированием персональных
   данных;
4. не считать наличие backup достаточным, пока restore drill не завершён успешно.

Backup-файлы, connection strings и production-данные нельзя сохранять в Git, CI artifacts общего
доступа или логи приложения.

## Restore

Restore выполняется в новую изолированную ветку/БД, а не поверх работающей production-БД:

1. остановить изменяющие данные release/jobs и определить точку восстановления;
2. восстановить snapshot/PITR средствами провайдера в новый target;
3. выдать target отдельные credentials и запустить `prisma migrate status`/проверку приложения без
   вывода URL и данных;
4. выполнить smoke-проверки каталога, авторизации, корзины и заказов на маскированной копии;
5. переключать production connection только после явного решения ответственного оператора и
   подготовленного плана возврата;
6. сохранить audit evidence без секретов, затем отозвать временные credentials.

Точные команды провайдера и RPO/RTO фиксируются при provisioning в пункте 82. Любое переключение
production target является отдельным, явно подтверждаемым действием.

## Forward-fix

После записи production-данных основной путь исправления — новая версионированная forward-fix
миграция. Нельзя редактировать уже применённый SQL, выполнять `prisma db push`, вручную удалять запись
из migration history или запускать destructive rollback вслепую.

1. остановить rollout приложения, но сохранить применённую migration history;
2. определить совместимость старой и новой версии и при необходимости отключить затронутую запись;
3. подготовить минимальную новую миграцию; для несовместимого изменения использовать
   `expand -> migrate -> contract`;
4. проверить SQL, блокировки и повторный запуск на восстановленной непроизводственной копии;
5. выпустить исправление через тот же preview-verified `prisma:migrate:deploy` процесс;
6. после smoke-проверки задокументировать причину, SHA, миграции и итог без секретов и персональных
   данных.

Restore вместо forward-fix выбирается только при подтверждённой потере/повреждении данных и после
оценки потери записей между точкой восстановления и инцидентом.
