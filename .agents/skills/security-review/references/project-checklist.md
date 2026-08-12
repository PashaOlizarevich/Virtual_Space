# Project security checklist

Применять только разделы, связанные с проверяемым изменением. PostgreSQL является источником истины,
Prisma — основным data access, Auth.js — механизмом сессий, Cloudinary — хранилищем изображений.

## Секреты и конфигурация

- Не искать значения в `.env`; проверять только имена в `.env.example` и обращения `process.env`.
- Убедиться, что `DATABASE_URL`, `AUTH_SECRET`, Cloudinary secret, Telegram token и OpenAI key
  остаются server-only и не попадают в bundle, ответы, ошибки и логи.
- Не допускать чувствительные значения с `NEXT_PUBLIC_` и hardcoded credentials.
- Проверять server-side validation обязательных env без вывода их значений.

## Входные данные и ответы

- Валидировать через Zod body, query, params, headers, формы, localStorage и внешние payload.
- Ограничивать длину строк, количество элементов, числовые диапазоны и неизвестные поля.
- Не передавать Prisma-модели напрямую; возвращать allowlisted DTO.
- Не раскрывать stack trace, SQL, внутренние идентификаторы и чувствительные поля.
- Проверять mass assignment и unsafe object spreading в Prisma `data`.

## Authentication и authorization

- Проверять session и роль `ADMIN` в каждом защищённом Route Handler и Server Action.
- Проверять ownership ресурса независимо от знания его ID; искать IDOR.
- Не считать middleware, скрытый UI и непубличный URL достаточной защитой.
- Не хранить auth token в localStorage. Оценивать cookie flags и session lifetime в контексте Auth.js.
- Для state-changing cookie-auth запросов оценивать Origin/SameSite и встроенную защиту до требования
  отдельного CSRF token.

## Каталог, корзина и заказы

- Не доверять цене, скидке, наличию, итоговой сумме и статусу от клиента.
- Перед заказом перечитывать товары из БД, проверять доступность и пересчитывать итог на сервере.
- Создавать заказ и позиции транзакционно; оценивать повторную отправку и idempotency.
- Проверять допустимые переходы статусов и административные права.
- Ограничивать количество строк и единиц товара для защиты от resource abuse.

## Prisma и PostgreSQL

- Запрещать SQL-конкатенацию; отдельно проверять raw queries и параметризацию.
- Проверять unique/foreign key/check-инварианты, cascade effects и чрезмерные выборки.
- Не импортировать Prisma в Client Components.
- Оценивать гонки check-then-write и использовать transaction/constraint там, где важна атомарность.
- Для schema change оценивать backfill, совместимость, откат и риск потери данных.

## Cloudinary и файлы

- Формировать подпись только на сервере и только после проверки роли/назначения загрузки.
- Ограничивать размер, разрешённые форматы, public ID/folder и transformation parameters.
- Не доверять одному MIME или расширению; проверять фактическую политику обработки Cloudinary.
- Не позволять клиенту произвольно удалять/перезаписывать ресурсы.
- Согласовывать удаление старого изображения с успешным сохранением нового состояния.

## XSS, CSP и браузер

- Избегать `dangerouslySetInnerHTML`; если HTML действительно требуется, определить строгий allowlist.
- Проверять пользовательские URL, redirect targets и вставку данных в HTML/JS/CSS контексты.
- Начинать CSP строго и разрешать только необходимые Next.js, Cloudinary и API origins.
- Не добавлять `unsafe-inline`/`unsafe-eval` без документированного временного основания.
- Проверять clickjacking, MIME sniffing, referrer policy и ограничения framing там, где применимо.

## Внешние интеграции и abuse

- Изолировать Cloudinary, Telegram и OpenAI адаптерами с timeout и контролируемыми ошибками.
- Не передавать внешнему сервису лишние персональные данные или внутренние инструкции.
- Telegram уведомлять только после фиксации заказа; сбой уведомления не должен откатывать заказ.
- Для login, order creation, upload signature и будущего AI оценивать rate limiting, quotas и расходы.
- Валидировать callback authenticity, replay protection и idempotency при появлении callbacks/webhooks.

## Логи и зависимости

- Не логировать токены, cookies, пароль, полный заказ, телефон, адрес и свободный комментарий.
- Редактировать чувствительные значения; разделять публичное сообщение и server-side diagnostics.
- Для зависимостей использовать read-only аудит. Не применять автоматические исправления без review.
- Проверять lock-файл, источник пакета, lifecycle scripts и релевантность advisory фактическому коду.

## Security-тесты

- Invalid input: malformed, oversized, unknown fields и граничные значения.
- Authentication: отсутствующая или недействительная session.
- Authorization: обычный пользователь против admin action; доступ к чужому ресурсу.
- Business logic: подменённая цена, недоступный товар, повторная отправка, неверный переход статуса.
- Upload: запрещённый тип/размер/folder и попытка получить подпись без прав.
- Error response: отсутствие stack trace, секретов и персональных данных.

## Attribution

Чек-лист адаптирован по мотивам ECC `security-review` для стека Virtual Space без копирования
нерелевантных Supabase, Express, Solana и payment-разделов.

Source: https://github.com/affaan-m/ECC/blob/main/skills/security-review/SKILL.md

ECC is distributed under the MIT License. Copyright (c) 2026 Affaan Mustafa.
