# Обзор API-слоя Virtual Space

Документ перечисляет реализованные серверные механизмы проекта по четырём направлениям: валидация
данных, авторизация, интеграции со сторонними сервисами и бизнес-логика.

## Валидация данных

- [Валидация административных credentials](../src/modules/auth/server/credentials.ts) — строгая
  проверка email и пароля, нормализация email и ограничение длины полей.
- [Публичные схемы авторизации](../src/modules/auth/schemas.ts) — Zod-схемы регистрации, входа и
  восстановления доступа без server-managed полей.
- [Проверки публичного ввода](../src/modules/auth/public-input-security.test.ts) — подтверждают запрет
  передачи `role`, `passwordHash` и неизвестных полей.
- [Схемы административного каталога](../src/modules/catalog/server/admin-schemas.ts) — строгие
  allowlist-схемы категорий, товаров, характеристик, опций и изображений.
- [Схемы настроек магазина](../src/modules/settings/server/admin-schemas.ts) — серверная проверка
  разрешённых полей административных настроек.
- [Route Handler подписи загрузки](../src/app/api/admin/uploads/signature/route.ts) — проверка JSON-body
  через `z.strictObject` и безопасные ответы для ошибок `400`, `401`, `403` и `500`.
- [Создание первого администратора](../src/modules/auth/server/first-admin.ts) — проверка и нормализация
  защищённых переменных процесса перед созданием учётной записи.
- [DTO каталога](../src/modules/catalog/server/dto.ts) и
  [DTO публичных настроек](../src/modules/settings/server/dto.ts) — безопасные сериализуемые контракты
  вместо прямой передачи Prisma-моделей и внутренних полей.

Используемые техники: Zod, `strictObject`, ограничения длины и диапазонов, нормализация email и slug,
allowlist полей, проверка идентификаторов и безопасное преобразование данных БД в DTO.

## Авторизация

- [Конфигурация Auth.js](../src/server/auth.ts) — Credentials provider и ограниченная по времени
  JWT-сессия.
- [Auth.js Route Handler](../src/app/api/auth/[...nextauth]/route.ts) — стандартные `GET` и `POST`
  обработчики Auth.js.
- [Проверка credentials](../src/modules/auth/server/credentials.ts) — поиск пользователя и допуск
  только учётной записи с актуальной ролью `ADMIN`.
- [Проверка административной сессии](../src/server/admin-auth.ts) и
  [логика доступа](../src/server/admin-access.ts) — повторное чтение пользователя из PostgreSQL и
  проверка текущей роли перед защищённой операцией.
- [Защищённая граница каталога](../src/modules/catalog/server/admin.ts) и
  [защищённая граница настроек](../src/modules/settings/server/admin.ts) — обязательная авторизация
  каждой экспортируемой административной операции.
- [Хеширование паролей](../src/modules/auth/server/password.ts) — versioned salted `scrypt` и
  constant-time сравнение хеша.
- [Bootstrap первого администратора](../src/modules/auth/server/first-admin.ts) и
  [CLI-команда](../scripts/create-first-admin.ts) — контролируемое создание первого `ADMIN` без
  хранения credentials в Git.
- [Тесты административной авторизации](../src/server/admin-authorization.test.ts) — проверка порядка
  контроля доступа и запрета выполнения операции для недопустимой сессии.

Используемые техники: Auth.js Credentials, JWT-сессия, роли `USER`/`ADMIN`, server-side проверка
сессии, повторная проверка роли в БД и запрет назначения роли через публичный ввод.

## Интеграция со сторонними сервисами

- [Server-only адаптер Cloudinary](../src/server/integrations/cloudinary.ts) — чтение конфигурации из
  переменных окружения, формирование подписей и ограниченный контракт внешнего сервиса.
- [Endpoint подписи Cloudinary](../src/app/api/admin/uploads/signature/route.ts) — выдаёт контракт
  загрузки только после проверки административного доступа.
- [Lifecycle изображений](../src/modules/catalog/server/image-lifecycle.ts) — проверка загруженного
  ресурса, согласованное сохранение, замена и удаление изображения.
- [Server Actions административного интерфейса](../src/modules/admin/server/actions.ts) — связывают
  UI с защищёнными операциями каталога, настроек и загрузок.
- [Подключение Prisma/PostgreSQL](../src/server/db.ts) и
  [Prisma schema](../prisma/schema.prisma) — server-only доступ к базе данных, доменным моделям и
  связям.

В [.env.example](../.env.example) перечислены только имена переменных PostgreSQL, Auth.js,
Cloudinary, Telegram и OpenAI без секретных значений. Наличие переменных Telegram и OpenAI не
считается доказательством готовой интеграции: фактически в проверенной части подключены Auth.js,
Prisma/PostgreSQL и Cloudinary.

## Бизнес-логика

- [CRUD-сервис каталога](../src/modules/catalog/server/admin-service.ts) — операции с категориями,
  товарами, характеристиками, группами и значениями опций и metadata изображений.
- [Защищённый каталог](../src/modules/catalog/server/admin.ts) — публичная серверная граница над
  внутренним Prisma-сервисом.
- [Управление настройками](../src/modules/settings/server/admin-service.ts) — чтение и обновление
  основной записи настроек через проверенный DTO.
- [Административные Server Actions](../src/modules/admin/server/actions.ts) — загрузка данных,
  мутации и адресная ревалидация затронутых страниц.
- [Публичный сервис каталога](../src/modules/catalog/server/service.ts) и
  [публичный сервис настроек](../src/modules/settings/server/service.ts) — server-only чтение только
  опубликованных и разрешённых данных.
- [Mapper каталога](../src/modules/catalog/server/mapper.ts) и
  [mapper настроек](../src/modules/settings/server/mapper.ts) — преобразование Prisma-результатов в
  безопасные DTO.
- [Lifecycle изображений](../src/modules/catalog/server/image-lifecycle.ts) — бизнес-правила
  подтверждения загрузки, замены изображения и обработки незавершённой внешней очистки.

Основные правила: уникальные нормализованные slug, точные decimal-цены, проверка связанных
сущностей, запрет удаления непустой категории, серверное управление служебными полями, безопасный
lifecycle изображений и возврат только разрешённых DTO.
