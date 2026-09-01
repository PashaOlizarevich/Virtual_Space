# Обзор API-слоя Virtual Space

Документ перечисляет реализованные серверные механизмы проекта по четырём направлениям: валидация
данных, авторизация, интеграции со сторонними сервисами и бизнес-логика.

## Основные файлы выполненного API-задания

### Аутентификация и контроль доступа

- [src/server/auth.ts](../src/server/auth.ts) — конфигурация Auth.js, Credentials provider,
  JWT-сессия и callbacks пользователя.
- [src/app/api/auth/[...nextauth]/route.ts](../src/app/api/auth/[...nextauth]/route.ts) — `GET` и `POST`
  endpoint Auth.js.
- [src/server/admin-auth.ts](../src/server/admin-auth.ts) — получение сессии и повторная проверка
  актуальной роли администратора в БД.
- [src/server/admin-access.ts](../src/server/admin-access.ts) — общий контракт разрешения
  административного доступа и безопасные ошибки доступа.
- [src/modules/auth/server/credentials.ts](../src/modules/auth/server/credentials.ts) — серверная
  валидация и проверка пользовательских и административных credentials.
- [src/modules/auth/server/public-auth.ts](../src/modules/auth/server/public-auth.ts) — регистрация,
  выпуск hash-only токена восстановления и атомарная смена пароля.
- [src/modules/auth/server/actions.ts](../src/modules/auth/server/actions.ts) — безопасные Server
  Actions регистрации и подтверждения сброса пароля.
- [src/server/user-auth.ts](../src/server/user-auth.ts) — проверка пользовательской сессии, состояния
  аккаунта и актуальной версии credentials.
- [src/modules/users/server/profile.ts](../src/modules/users/server/profile.ts) — чтение и изменение
  только собственного профиля через allowlist DTO.
- [src/modules/users/server/actions.ts](../src/modules/users/server/actions.ts) — transport профиля со
  стабильными кодами ошибок.
- [src/modules/cart/server/cart-service.ts](../src/modules/cart/server/cart-service.ts) —
  ownership-scoped чтение, ревалидация и мутации persistent-корзины пользователя.
- [src/modules/cart/server/actions.ts](../src/modules/cart/server/actions.ts) — защищённый transport
  серверной корзины со стабильными безопасными кодами результата.
- [src/modules/auth/server/password.ts](../src/modules/auth/server/password.ts) — хеширование и
  проверка паролей через `scrypt`.
- [src/modules/auth/server/first-admin.ts](../src/modules/auth/server/first-admin.ts) — безопасная
  доменная операция создания первого администратора.
- [scripts/create-first-admin.ts](../scripts/create-first-admin.ts) — отдельная CLI-команда bootstrap
  администратора без хранения пароля в Git.

### API и административные операции

- [src/modules/admin/server/actions.ts](../src/modules/admin/server/actions.ts) — защищённые Server
  Actions административного интерфейса.
- [src/app/api/admin/uploads/signature/route.ts](../src/app/api/admin/uploads/signature/route.ts) —
  Route Handler подписанного контракта загрузки Cloudinary.
- [src/modules/catalog/server/admin.ts](../src/modules/catalog/server/admin.ts) — авторизованная
  серверная граница операций каталога.
- [src/modules/catalog/server/admin-service.ts](../src/modules/catalog/server/admin-service.ts) —
  реализация CRUD категорий, товаров, характеристик, опций и metadata изображений.
- [src/modules/catalog/server/admin-schemas.ts](../src/modules/catalog/server/admin-schemas.ts) —
  строгие Zod-схемы административного каталога.
- [src/modules/settings/server/admin.ts](../src/modules/settings/server/admin.ts) — авторизованная
  серверная граница управления настройками.
- [src/modules/settings/server/admin-service.ts](../src/modules/settings/server/admin-service.ts) —
  чтение и изменение основной записи настроек магазина.
- [src/modules/settings/server/admin-schemas.ts](../src/modules/settings/server/admin-schemas.ts) —
  строгая allowlist-валидация настроек.
- [src/server/integrations/cloudinary.ts](../src/server/integrations/cloudinary.ts) — server-only
  адаптер внешнего сервиса Cloudinary.

### Документация реализации

- [docs/implementation-plan.md](implementation-plan.md) — последовательность реализации API- и
  DB-слоя.
- [docs/first-db-release-decisions.md](first-db-release-decisions.md) — фактически принятые решения по
  выполненным пунктам плана.
- [docs/progress.md](progress.md) — журнал завершённых задач и выполненных проверок.
- [docs/architecture.md](architecture.md) — архитектурные границы и потоки данных проекта.

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

## Серверная корзина пользователя

- [src/modules/cart/server/schemas.ts](../src/modules/cart/server/schemas.ts) принимает только
  `productId`, выбранные стабильные ключи опций и ограниченное количество; неизвестные поля, цена и
  server-managed `optionsKey` отклоняются.
- [src/modules/cart/server/cart-service.ts](../src/modules/cart/server/cart-service.ts) получает
  владельца из актуальной Auth.js session, ограничивает каждый Prisma write через `cart.userId` и
  возвращает allowlisted DTO без Prisma-моделей и внутренних id.
- [src/modules/cart/server/actions.ts](../src/modules/cart/server/actions.ts) предоставляет операции
  чтения, изменения количества и удаления для собственного UI и отображает ожидаемые ошибки в
  стабильные коды без раскрытия БД.
- [src/modules/cart/server/cart-merge.ts](../src/modules/cart/server/cart-merge.ts) атомарно
  объединяет гостевой снимок с корзиной текущего пользователя, повторно загружая товары и используя
  серверные цену, активность, конфигурацию и остаток.
- [src/modules/cart/server/merge-action.ts](../src/modules/cart/server/merge-action.ts) предоставляет
  отдельную Server Action с безопасными результатами `UNAUTHENTICATED`, `INVALID_INPUT` и
  `CART_CONFLICT` для будущей интеграции входа.

Чтение одновременно ревалидирует активность товара, полный набор опций, изменение Decimal-цены и
суммарное количество товара во всех конфигурациях корзины. Изменение количества повторяет проверки,
не доверяет клиентской цене и сохраняет актуальную цену из PostgreSQL. Удаление и update используют
каноническую идентичность конфигурации и ownership-предикат; знание чужого product/configuration не
даёт доступа к позиции. Merge выполняется целиком в `Serializable`-транзакции, суммирует одинаковые
канонические конфигурации с существующими позициями и не принимает `observedPrice`; при любом
конфликте серверная корзина остаётся неизменной. UI подключается к этому контракту в пункте 76.

## Авторизация

- [Конфигурация Auth.js](../src/server/auth.ts) — Credentials provider и ограниченная по времени
  JWT-сессия.
- [Auth.js Route Handler](../src/app/api/auth/[...nextauth]/route.ts) — стандартные `GET` и `POST`
  обработчики Auth.js.
- [Проверка credentials](../src/modules/auth/server/credentials.ts) — единый поиск активного
  пользователя с паролем; административная wrapper-граница дополнительно требует роль `ADMIN`.
- [Пользовательская сессия](../src/server/user-auth.ts) — защищённые операции повторно читают
  пользователя и отклоняют удалённый аккаунт или JWT со старой `credentialsVersion`.
- [Восстановление доступа](../src/modules/auth/server/public-auth.ts) — случайный одноразовый секрет
  хранится только как SHA-256 hash, действует 30 минут и потребляется транзакционно со сменой
  password hash и отзывом прежних credentials-сессий.
- [Профиль](../src/modules/users/server/profile.ts) — ownership определяется только из Auth.js
  session; клиент не передаёт user id или роль.
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
- [Server-only адаптер Telegram](../src/server/integrations/telegram.ts) — валидирует server-only
  конфигурацию, отправляет минимальное уведомление о созданном заказе с timeout и проверяет ответ
  Bot API.
- [Создание заказа](../src/modules/orders/server/order-creation.ts) — вызывает Telegram только после
  разрешения serializable-транзакции; ошибка доставки перехватывается отдельно и не меняет успешный
  DTO заказа.
- [Server Actions административного интерфейса](../src/modules/admin/server/actions.ts) — связывают
  UI с защищёнными операциями каталога, настроек и загрузок.
- [Подключение Prisma/PostgreSQL](../src/server/db.ts) и
  [Prisma schema](../prisma/schema.prisma) — server-only доступ к базе данных, доменным моделям и
  связям.

В [.env.example](../.env.example) перечислены только имена переменных PostgreSQL, Auth.js,
Cloudinary, Telegram и OpenAI без секретных значений. Фактически в проверенной части подключены
Auth.js, Prisma/PostgreSQL, Cloudinary и Telegram; наличие имени `OPENAI_API_KEY` ещё не считается
готовой интеграцией OpenAI.

## Бизнес-логика

- [Административное изменение статуса заказа](../src/modules/orders/server/order-status-update.ts) —
  повторно читает текущий статус внутри транзакции, проверяет закрытую матрицу переходов, условно
  обновляет `Order.status` и в той же транзакции создаёт `OrderStatusHistory` с идентификатором
  администратора. Гонка условного обновления возвращается как контролируемый конфликт.
- [PATCH статуса заказа](../src/app/api/admin/orders/[orderNumber]/status/route.ts) — защищённая
  HTTP-граница со строгим DTO и безопасными ответами `400`, `401`, `403`, `404`, `409` и `500`.

- [CRUD-сервис каталога](../src/modules/catalog/server/admin-service.ts) — операции с категориями,
  товарами, характеристиками, группами и значениями опций и metadata изображений; удаление товара
  с историей заказа заменяется деактивацией, а ответ различает `deactivated` и `deleted`.
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
сущностей, запрет удаления непустой категории и использованного в заказе товара, серверное управление
служебными полями, безопасный lifecycle изображений и возврат только разрешённых DTO.

## Проверка гостевой корзины перед заказом

- [src/modules/orders/server/schemas.ts](../src/modules/orders/server/schemas.ts) — строгий
  allowlist входной корзины с пределами строк, количества и выбранных опций.
- [src/modules/orders/server/queries.ts](../src/modules/orders/server/queries.ts) — один ограниченный
  Prisma-запрос актуальных товаров и конфигураций по уникальным ID.
- [src/modules/orders/server/cart-validation.ts](../src/modules/orders/server/cart-validation.ts) —
  server-only сервис, который возвращает проверенные серверные снимки и типизированные причины
  недоступности, нехватки остатка, устаревшей конфигурации или изменения цены.
- [src/modules/orders/server/checkout-preflight.ts](../src/modules/orders/server/checkout-preflight.ts) —
  checkout-граница с взаимоисключающими результатами `READY` и `CONFLICT`; частично проверенная
  корзина никогда не становится основанием для создания заказа.
- [src/app/api/orders/preflight/route.ts](../src/app/api/orders/preflight/route.ts) — публичный
  `POST /api/orders/preflight`, возвращающий `409` и актуальную server-owned цену при конфликте,
  `400` для невалидного ввода и безопасный `500` без внутренних деталей.

Клиент подтверждает новую цену повторной отправкой корзины, где `observedPrice` заменён значением из
конфликта; до этого preflight остаётся в состоянии `CONFLICT`. Контракт не создаёт заказ и не
изменяет остаток. Клиентские цена, количество, доступность и подписи опций не используются как
источник истины: все значения повторно проверяются по PostgreSQL.

## Переходы статуса заказа

- [src/modules/orders/server/status-transitions.ts](../src/modules/orders/server/status-transitions.ts) —
  server-only доменный инвариант с закрытой матрицей переходов Prisma `OrderStatus`.
- Разрешены только `NEW -> CONFIRMED`, `NEW -> CANCELLED`, `CONFIRMED -> IN_PROGRESS`,
  `CONFIRMED -> CANCELLED`, `IN_PROGRESS -> COMPLETED` и `IN_PROGRESS -> CANCELLED`.
- `assertOrderStatusTransition` выбрасывает контролируемую `InvalidOrderStatusTransitionError` до
  выполнения вызывающим write-service любых мутаций. Повтор текущего статуса, выход из финальных
  состояний и остальные пары запрещены.

Этот пункт не добавляет transport и не изменяет PostgreSQL. Административная авторизация, повторное
чтение текущего статуса и атомарная запись статуса вместе с историей относятся к пункту 63.

## Создание гостевого заказа

- [src/modules/orders/server/order-creation.ts](../src/modules/orders/server/order-creation.ts) —
  доменный сервис, который внутри serializable Prisma-транзакции повторяет полную проверку корзины,
  условно уменьшает остатки, рассчитывает `Decimal`-итог и создаёт `Order`, все снимки `OrderItem` и
  начальную запись `OrderStatusHistory`.
- [src/app/api/orders/route.ts](../src/app/api/orders/route.ts) — публичный `POST /api/orders`;
  возвращает allowlisted номер, итог и статус с HTTP `201`, контролируемый конфликт корзины с HTTP
  `409`, безопасные `400` и `500` без внутренних деталей.

Вход содержит строгие `contact` и `cart`; неизвестные поля, пустая или чрезмерная корзина,
некорректные контакты и конфигурации отклоняются. Цена, итог, название, подписи опций, активность и
остаток никогда не копируются из клиента. Условное `updateMany` не допускает отрицательного остатка,
а любая ошибка до commit откатывает уже выполненные уменьшения вместе со всем графом заказа.

Клиентская граница [src/modules/checkout/submit-order.ts](../src/modules/checkout/submit-order.ts)
строго проверяет DTO ответа. Она не отправляет итог заказа, не очищает корзину при `409` и требует
отдельного пользовательского подтверждения `currentPrice` перед повторной отправкой.

## Чтение заказов

- [src/modules/orders/server/read-schemas.ts](../src/modules/orders/server/read-schemas.ts) — строгие
  схемы guest/user lookup и ограниченной административной пагинации.
- [src/modules/orders/server/order-read.ts](../src/modules/orders/server/order-read.ts) — явные
  Prisma `select`, ownership-фильтры и allowlisted DTO покупателя и администратора.
- [src/modules/orders/server/admin.ts](../src/modules/orders/server/admin.ts) — server-only граница,
  перепроверяющая актуальную роль `ADMIN` перед выборкой.
- [src/app/api/orders/lookup/route.ts](../src/app/api/orders/lookup/route.ts) — публичный
  `POST /api/orders/lookup`; пользователь доказывает владение session `userId`, гость — парой
  `orderNumber + email`. Несовпадение ownership и отсутствие заказа одинаково возвращают `404`.
- [src/app/api/admin/orders/route.ts](../src/app/api/admin/orders/route.ts) — защищённый
  `GET /api/admin/orders?limit=&cursor=` с максимум 100 строками и безопасными `400/401/403/500`.

Покупательский DTO не содержит контактов или внутреннего id заказа. Административный DTO включает
контактный снимок, необходимый для обработки заявки, но не возвращает Prisma-модель. Сортировка
административной страницы стабильна: `createdAt DESC, id DESC`; наружу cursor передаётся как
уникальный `publicNumber`.

Первая страница `/admin/orders` загружается через server-only `getAdminOrders` после проверки Auth.js.
[src/modules/admin/orders-transport.ts](../src/modules/admin/orders-transport.ts) валидирует
allowlisted DTO для клиентского повторного GET и отправляет PATCH только с новым enum-статусом;
текущая роль и допустимость перехода по-прежнему повторно проверяются сервером.
