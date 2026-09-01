# Жизненный цикл миграций PostgreSQL

Этот документ определяет обязательный протокол изменения `prisma/schema.prisma` и версионированной
истории `prisma/migrations`. Он дополняет release-процесс из
`docs/first-db-release-decisions.md`; применение миграций к preview и production относится к
отдельному release-шагу.

## Базовые правила

- Изменение Prisma schema поставляется в одной рабочей ветке с кодом, который его использует, и с
  новой директорией `prisma/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql`.
- Уже зафиксированные `migration.sql` и `migration_lock.toml` неизменяемы. Исправление поставляется
  следующей forward-fix миграцией.
- `prisma db push` запрещён для shared local, preview и production. Команда допустима только для
  одноразовой персональной scratch-БД, история которой не используется другими средами; её результат
  не заменяет SQL-миграцию.
- `prisma migrate dev` используется только разработчиком с отдельной local/dev веткой PostgreSQL.
  Release-среды применяют только проверенную историю миграций.
- Seed, backfill и внешние сетевые вызовы не выполняются внутри schema-миграции автоматически.

## Классификация изменения

Перед созданием SQL изменение фиксируется как один из вариантов:

1. `schema-only` — Prisma schema меняется без изменения существующих данных; если меняется физическая
   схема PostgreSQL, всё равно нужна версионированная SQL-миграция.
2. `data migration` — меняются только существующие данные; операция должна быть повторяемой или иметь
   явный checkpoint и не должна удерживать одну длительную транзакцию без необходимости.
3. `schema + data` — схема и backfill связаны; для несовместимого изменения обязательны отдельные
   релизы `expand -> migrate -> contract`.

Совместимый `expand` добавляет nullable-поле, таблицу или новый контракт так, чтобы старая и новая
версии приложения могли работать одновременно. `migrate` выполняет ограниченный backfill и
переключает чтение/запись после проверки полноты. `contract` удаляет старую структуру только в
следующем релизе, когда старых потребителей и необработанных строк больше нет.

## Проверка перед commit

1. Просмотреть `git diff` для schema, использующего её кода и нового SQL.
2. Проверить SQL на `DROP`, сужение типов, table rewrite, `NOT NULL` без default/backfill, длительные
   блокировки, порядок FK/индексов и совместимость со старой версией приложения.
3. Обосновать rollback либо forward-fix. После записи production-данных по умолчанию используется
   forward-fix, а не ручное удаление применённой миграции.
4. Выполнить:

   ```text
   npm run prisma:check-migrations
   npm run prisma:validate
   npm run prisma:generate
   npm run typecheck
   ```

`prisma:check-migrations` сравнивает текущую ветку с `origin/main` или `main`, запрещает изменение и
удаление существующей истории и требует новый timestamped `migration.sql` при изменении schema. В CI
базу сравнения следует задавать явно переменной `MIGRATION_BASE_REF` (например, SHA целевой ветки),
чтобы shallow clone или нестандартное имя основной ветки не ослабили проверку.

Проверка структуры не доказывает безопасность SQL. Миграция считается готовой только после ручного
review SQL и последующей проверки на изолированной preview или восстановленной непроизводственной
копии согласно пункту 80 плана.

## Отдельный release-шаг

Миграции применяет только release-only команда, запущенная из чистого immutable Git checkout после
`npm ci`:

```text
npm run prisma:migrate:deploy -- --environment=preview --artifact-sha=<full-git-sha>
npm run prisma:migrate:deploy -- --environment=production --artifact-sha=<full-git-sha> --preview-verified-sha=<full-git-sha>
```

Команда требует direct `DATABASE_URL_UNPOOLED`, сначала запускает проверку migration history и
отказывается работать при dirty tree или несовпадении SHA. Production допускается только при явном
подтверждении, что на preview или восстановленной непроизводственной копии был проверен тот же commit;
SHA в обоих аргументах должен совпадать. Для проверки guard-условий без подключения и изменения БД
используется `--dry-run`, но переменная подключения всё равно обязательна, чтобы preflight повторял
контракт настоящего release job.

Порядок релиза:

1. Вручную проверить SQL, восстановление/forward-fix и совместимость со старой и новой версией кода.
2. Применить immutable artifact к изолированной preview-БД и выполнить тесты приложения.
3. Сохранить проверенный full SHA как release evidence; изменение commit аннулирует проверку.
4. Для production передать тот же SHA в `--artifact-sha` и `--preview-verified-sha`, применить
   миграции до rollout приложения и затем выполнить smoke-проверку.

Скрипт не импортируется приложением и не включён в `build`, `start`, Server Action или Route Handler,
поэтому миграции не запускаются при build, старте процесса или serverless cold start. Автоматический
production pipeline, protected environment и сериализация jobs относятся к пункту 82.
