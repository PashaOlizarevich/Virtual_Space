# Product Tour — карта сайта Virtual Space

Этот документ помогает быстро найти страницу, видимый блок или функцию сайта и понять, в каком
файле их изменять. Карта описывает фактически реализованный интерфейс, а не все пункты технического
задания.

## Как читать пути

- URL — адрес страницы в браузере, например `/catalog`.
- Файл маршрута — React-страница, которая собирает экран целиком.
- Компонент — отдельный блок с интерфейсом или поведением.
- Данные — тексты, товары и другие значения, которые вынесены из компонента.
- Стили всех текущих экранов находятся в `src/styles/globals.css`; нужный блок удобно искать по
  имени CSS-класса, указанному в этой карте.
- Папка `(store)` — route group Next.js. Она группирует публичные страницы в коде, но не добавляет
  `(store)` в URL: `src/app/(store)/about/page.tsx` открывается по адресу `/about`.
- Сегмент `[id]` динамический: `src/app/(store)/product/[id]/page.tsx` обслуживает все адреса вида
  `/product/<slug>`.

## Быстрая карта маршрутов

| URL                   | Экран                | Файл маршрута                                | Главный компонент или источник                       |
| --------------------- | -------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `/`                   | Главная              | `src/app/(store)/page.tsx`                   | `ProductPreview`, `featuredProducts`, `storeProfile` |
| `/catalog`            | Каталог              | `src/app/(store)/catalog/page.tsx`           | `CatalogCategoryShowcase`, `CatalogQueryGrid`        |
| `/new`                | Новинки              | `src/app/(store)/new/page.tsx`               | `ProductPreview`, `getActiveNewArrivals`             |
| `/sale`               | Акции                | `src/app/(store)/sale/page.tsx`              | `PromotionHero`, `PromotionProductGrid`              |
| `/catalog/sofas`      | Диваны               | `src/app/(store)/catalog/sofas/page.tsx`     | `ProductPreview`, `sofaCategoryProducts`             |
| `/catalog/chairs`     | Стулья               | `src/app/(store)/catalog/chairs/page.tsx`    | `ProductPreview`, `chairCategoryProducts`            |
| `/catalog/tableware`  | Посуда               | `src/app/(store)/catalog/tableware/page.tsx` | `ProductPreview`, `lumoTablewareProduct`             |
| `/product/<slug>`     | Карточка товара      | `src/app/(store)/product/[id]/page.tsx`      | `ProductGallery`, `ProductConfigurator`              |
| `/about`              | О магазине           | `src/app/(store)/about/page.tsx`             | `storeProfile`                                       |
| `/stores`             | Магазины             | `src/app/(store)/stores/page.tsx`            | `stores`                                             |
| `/login`              | Вход и регистрация   | `src/app/(store)/login/page.tsx`             | `AuthForms`                                          |
| `/profile`            | Личный кабинет       | `src/app/(store)/profile/page.tsx`           | `ProfileDashboard`                                   |
| `/checkout`           | Оформление заявки    | `src/app/(store)/checkout/page.tsx`          | `CheckoutForm`                                       |
| `/admin`              | Обзор администратора | `src/app/admin/page.tsx`                     | `AdminDashboard`                                     |
| `/admin/products`     | Управление товарами  | `src/app/admin/products/page.tsx`            | `AdminProductsManager`                               |
| `/admin/orders`       | Управление заказами  | `src/app/admin/orders/page.tsx`              | `AdminOrdersManager`                                 |
| `/admin/settings`     | Настройки магазина   | `src/app/admin/settings/page.tsx`            | `AdminSettingsManager`                               |
| Любой неизвестный URL | Страница 404         | `src/app/not-found.tsx`                      | `FeedbackState`                                      |

## Общая оболочка публичного сайта

### Корневой layout

`src/app/layout.tsx` подключает глобальные метаданные, провайдеры, общие стили, skip-link и анимацию
перехода между маршрутами.

- Общий `<title>` и описание сайта: `src/app/layout.tsx`.
- Клиентские провайдеры каталога, корзины и Auth.js-сессии: `src/app/providers.tsx`.
- Анимация перехода: `src/components/layout/route-transition.tsx`.
- Экран загрузки: `src/app/loading.tsx`.
- Общая обработка ошибки: `src/app/error.tsx`.
- Страница «не найдено»: `src/app/not-found.tsx`.
- Общие стили, цвета, размеры, адаптивность и анимации: `src/styles/globals.css`.

### Шапка сайта

Шапка показывается на всех публичных страницах благодаря `src/app/(store)/layout.tsx`.

Основной файл: `src/components/layout/header.tsx`.

- Desktop-шапка двухуровневая: логотип расположен по центру верхнего уровня, а нижний уровень
  объединяет навигацию «Каталог», «Магазины», «Новинки», «Акции», «О нас» и действия поиска,
  личного кабинета и корзины. «Каталог» открывает доступную mega-menu панель с десятью категориями
  и ссылкой «Весь каталог»; каждая категория ведёт на свою страницу `/catalog/<category>`, а
  «Весь каталог» — на общую витрину `/catalog`.
  «Новинки» ведут на отдельную страницу `/new`, а «Акции» — на `/sale`,
  «Магазины» — на отдельную страницу четырёх шоурумов; переход на главную доступен через логотип.

### Магазины — `/stores`

Файлы: `src/app/(store)/stores/page.tsx`, `src/modules/stores/components/store-slider.tsx` и
`src/modules/stores/mock-data.ts`.

Страница рассказывает общую историю пространств Virtual Space и показывает магазины в Нью-Йорке,
Москве, Минске и Париже. Магазинные блоки чередуют положение информации и галереи; в каждом доступны
адрес, режим работы, крупный кадр со стрелками и четыре миниатюры: фасад, интерьер, ресепшен и
интерьерная деталь.
Массив ссылок `navigationItems` находится в `header.tsx`.

- Логотип `VIRTUAL SPACE` ведёт на `/`. Текст и анимационные задержки букв находятся в
  `header.tsx`.
- Кнопка поиска сейчас только отображается и не открывает поиск.
- Иконка пользователя ведёт на `/login`.
- Иконка сердца между личным кабинетом и корзиной ведёт на `/favorites`.
- Иконка корзины открывает drawer-компонент
  `src/modules/cart/components/cart-widget.tsx`.
- Мобильное меню, его ссылки, переходы в `/profile`, `/favorites` и открытие корзины находятся в
  `src/components/layout/mobile-navigation.tsx`.

### Новинки — `/new`

Файлы: `src/app/(store)/new/page.tsx`, `src/modules/catalog/new-arrivals.ts`,
`src/modules/catalog/mock-data.ts` и общий `src/modules/catalog/components/product-preview.tsx`.

Страница показывает товары, у которых текущий момент входит в заданный включительный интервал
`newFrom` — `newUntil`, и сортирует их по началу периода от более новых к более ранним. Даты в
mock-контракте хранятся как ISO 8601 UTC-строки; товар без полного корректного периода не считается
новинкой. Карточки получают текстовую метку «Новинка», а при отсутствии активных позиций страница
показывает доступное пустое состояние со ссылкой на `/catalog`.

Поля пока задаются только в общем mock-каталоге. Preview-админка не управляет публичной страницей;
переключатель «Показывать в новинках», дата начала и дата окончания с рекомендуемым периодом 30 дней
должны появиться вместе с постоянным backend/Prisma-хранилищем.

### Акции — `/sale`

Файлы: `src/app/(store)/sale/page.tsx`, `src/modules/promotions/promotions.ts`,
`src/modules/promotions/mock-data.ts` и компоненты в `src/modules/promotions/components`.

Страница показывает редакционный hero главной активной акции, её включительный период и товары всех
действующих акций. Доменная функция получает дату явно, исключает неактивные акции и отсутствующие
товары, рассчитывает процентную цену и не допускает повторного применения акции к одному товару.
Карточка переиспользует `ProductPreview`, поэтому сохраняет избранное, переход к товару и добавление в
корзину, но дополнительно показывает зачёркнутую исходную цену, текущую цену и текстовый процент
скидки. Если активных предложений нет, доступно пустое состояние со ссылкой на каталог.

Текущий источник данных — mock-витрина. Перед production-оформлением заказа сервер должен заново
проверить применимость акции и рассчитать цену, а заказ — сохранить снимок итоговой цены и акции.

### Футер сайта

Футер показывается после основного содержимого на всех публичных страницах через
`src/app/(store)/layout.tsx` и не входит в административную часть.

Основные файлы: `src/components/layout/site-footer.tsx` и
`src/components/layout/scroll-to-top-button.tsx`.

- Навигация «О компании» ведёт на существующие страницы `/about`, `/stores` и контактный раздел
  страницы «О нас»; покупательские разделы отображаются как готовящиеся и не создают битые маршруты.
- Название, телефон, часы работы, почта и адрес загружаются из основной записи `StoreSettings`
  через `src/modules/settings/server/service.ts`.
- Социальные кнопки и их безопасные HTTPS-ссылки берутся из основной записи `StoreSettings`.
- Кнопка «Наверх» плавно прокручивает страницу к началу и отключает плавность при
  `prefers-reduced-motion`.
- Разметка, категории и focus-management панели каталога находятся в
  `src/components/layout/catalog-menu.tsx`; на mobile пункт «Каталог» закрывает основную навигацию и
  открывает адаптивную версию этой же панели.
- Раскрывающийся поиск реализован отдельным Client Component в
  `src/components/layout/header-search.tsx`: он управляет фокусом, закрывается по Escape и клику
  снаружи, а непустой запрос отправляет GET-формой на `/catalog?search=...`.
- Стили шапки ищите по `.header`, `.header__*`; мобильного меню — по `.mobile-navigation*` в
  `src/styles/globals.css`.

Важно: desktop- и mobile-меню используют отдельные массивы `navigationItems` для четырёх обычных
ссылок. Пункт «Каталог» общий и управляется `CatalogMenu`, поэтому при изменении навигации нужно
проверять оба массива и этот компонент.

### Корзина

Корзина не имеет отдельного URL: это выезжающая панель из шапки.

- Разметка, изменение количества, удаление позиции, итог и ссылки на товар/оформление:
  `src/modules/cart/components/cart-widget.tsx`.
- Состояние корзины и сохранение в браузере: `src/modules/cart/store.ts`.
- Проверка актуальности позиции: `src/modules/cart/validation.ts`.
- Синхронизация Auth.js/PostgreSQL: `src/modules/auth/session-provider.tsx`,
  `src/modules/cart/server-cart-adapter.ts` и защищённые cart Server Actions.
- Защищённая persistent-корзина пользователя реализована server-only сервисом и Server Actions в
  `src/modules/cart/server/`; там же доступно атомарное объединение гостевого снимка после Auth.js
  входа. UI подключается к этому transport на интеграционном этапе 76 и пока продолжает использовать
  preview-синхронизацию.
- Типы: `src/modules/cart/types.ts`.
- Стили: классы `.cart-widget*` в `src/styles/globals.css`.

## Публичные страницы

### Избранное — `/favorites`

Публичная страница показывает сохранённые гостем товары в порядке добавления. Сердце на общей
карточке `ProductPreview` и кнопка на странице конкретного товара добавляют или удаляют товар;
повторное нажатие на странице избранного сразу убирает карточку. При пустом списке показаны
пояснение и переход в каталог.

- Маршрут и актуальный mock-каталог: `src/app/(store)/favorites/page.tsx`.
- Сетка и сопоставление сохранённых ID с каталогом:
  `src/modules/favorites/components/favorites-grid.tsx`.
- Кнопка-сердце: `src/modules/favorites/components/favorite-button.tsx`.
- Валидация и гостевое хранение ID в localStorage: `src/modules/favorites/schemas.ts` и
  `src/modules/favorites/store.ts`.
- Стили: `.favorites-page*` и `.product-preview__favorite` в `src/styles/globals.css`.

Ограничение текущего этапа: избранное хранится только в браузере и не связано с preview-авторизацией.
После появления Auth.js и PostgreSQL гостевой список должен объединяться с серверным после входа.

### Главная — `/`

Файл: `src/app/(store)/page.tsx`.

Экран идёт сверху вниз:

1. Hero с главным заголовком, фоновым изображением и кнопкой «Смотреть коллекцию». Кнопка ведёт к
   якорю `#showcase` на этой же странице.
2. «Избранное для вашего дома» — сетка карточек `ProductPreview`.
3. «Почему Virtual Space» — три преимущества из локального массива `advantages`.

Где править:

- Композицию, заголовки, преимущества и hero: `src/app/(store)/page.tsx`.
- Hero-изображение: `public/images/home/hero-v2.png`; его путь также задан в `page.tsx`.
- Карточку товара и быстрый просмотр: `src/modules/catalog/components/product-preview.tsx`.
- Первые четыре товара и описание магазина: server-only services в
  `src/modules/catalog/server/service.ts` и `src/modules/settings/server/service.ts`.
- Стили: `.home-*` и `.product-preview*` в `src/styles/globals.css`.

### Каталог — `/catalog`

Файл: `src/app/(store)/catalog/page.tsx`.

На странице находятся вводный заголовок, редакционная мозаика десяти категорий и раздел «Все
предметы». Каждая атмосферная обложка целиком ведёт на существующую страницу категории; отдельные
изображения хранятся вне товарных папок. Категории и полная сетка загружаются из PostgreSQL в
Server Component, а пустой результат и клиентская пагинация управляются `CatalogQueryGridView`.
Товары выводятся постранично: по 12 карточек на desktop/tablet и по 5 на экранах уже 600 пикселей.
Стрелки, индикаторы и мобильный горизонтальный свайп переключают страницы без autoplay; текущая
страница хранится в `?page=`, поддерживает Back/Forward и пересчитывается при смене breakpoint с
сохранением первого видимого товара.

Где править:

- Заголовок и описание страницы: `src/app/(store)/catalog/page.tsx`.
- Категории, тексты и композицию обложек:
  `src/modules/catalog/components/catalog-category-showcase.tsx`.
- Атмосферные изображения категорий: `public/images/catalog-categories/`.
- Получение и состояния списка: `src/modules/catalog/components/catalog-query-grid.tsx`.
- Источник ассортимента и категорий: `src/modules/catalog/server/service.ts`; Prisma-запросы и
  безопасные DTO находятся в `src/modules/catalog/server/`.
- Вид карточки, кнопки «Подробнее», «В корзину» и быстрый просмотр:
  `src/modules/catalog/components/product-preview.tsx`.
- На desktop быстрый просмотр открывается при наведении мыши с короткой задержкой или сразу при
  фокусе с клавиатуры на карточках общего каталога и отдельных категорий.
- Список товаров, цены, изображения и slug: PostgreSQL-модели каталога через публичный service DTO.
- Структуру товара: `src/modules/catalog/types.ts`.
- Стили: `.catalog-page*` и `.product-preview*` в `src/styles/globals.css`.

### Диваны — `/catalog/sofas`

Страница открывается по ссылке «Диваны» в общей панели каталога. На ней находятся описание
категории и пять карточек: существующий диван Modul и модели Lento, Vela, Nord и Aura. Каждый товар
можно добавить в корзину или открыть на отдельной странице.

Где править:

- Заголовок, описание и композицию: `src/app/(store)/catalog/sofas/page.tsx`.
- Состав категории и данные товаров: PostgreSQL-выборка по slug `sofas`.
- Изображения новых товаров: `public/images/sofas/`; изображение Modul: `public/images/home/modul.png`.
- Стили: `.sofas-page*` в `src/styles/globals.css`.

### Посуда — `/catalog/tableware`

Файл: `src/app/(store)/catalog/tableware/page.tsx`.

Страница открывается по ссылке «Посуда» в общей панели каталога. На ней находятся описание
категории и одна широкая карточка набора тарелок Lumo с переходом на страницу товара и добавлением
в корзину.

Где править:

- Заголовок, описание и композицию: `src/app/(store)/catalog/tableware/page.tsx`.
- Данные товаров: PostgreSQL-выборка по slug категории `tableware`.
- Изображение: `public/images/tableware/lumo-plates.png`.
- Стили: `.tableware-page*` в `src/styles/globals.css`.

### Стулья — `/catalog/chairs`

Файл: `src/app/(store)/catalog/chairs/page.tsx`.

Страница открывается по ссылке «Стулья» в общей панели каталога. На ней находятся описание
категории и три карточки: существующий Arco, а также Noma и Tera. Каждый товар можно добавить в
корзину или открыть на отдельной странице.

Где править:

- Заголовок, описание и композицию: `src/app/(store)/catalog/chairs/page.tsx`.
- Состав категории и данные товаров: PostgreSQL-выборка по slug `chairs`.
- Изображения новых товаров: `public/images/chairs/`.
- Стили: `.chairs-page*` в `src/styles/globals.css`.

### Страница товара — `/product/<slug>`

Файл: `src/app/(store)/product/[id]/page.tsx`. Пример адреса: `/product/forma-armchair`. Значение
`<slug>` валидируется server service и сопоставляется с активным товаром в PostgreSQL.

На странице находятся хлебные крошки, слайдер галереи с кнопкой-сердцем поверх фотографии, название
и описание, выбор конфигурации, добавление в корзину и характеристики. При нескольких изображениях
слайдер показывает стрелки, счётчик и миниатюры, поддерживает клавиши со стрелками и горизонтальный
свайп. Для единственного изображения неактивные элементы управления скрыты. Неизвестный slug
открывает страницу 404.

Где править:

- Общую компоновку и хлебные крошки: файл маршрута `[id]/page.tsx`.
- Галерею: `src/modules/catalog/components/product-gallery.tsx`.
- Цена, варианты и добавление в корзину:
  `src/modules/catalog/components/product-configurator.tsx`.
- Галерея и кнопка добавления в избранное поверх фотографии:
  `src/modules/catalog/components/product-gallery.tsx`.
- Контент конкретного товара: `src/modules/catalog/server/service.ts` и PostgreSQL.
- Изображения товаров: `public/images/<category-slug>/<product-slug>/`; порядок и alt-тексты
  задаются записями `ProductImage`, упорядоченными полем `position`.
- Стили: `.product-detail*`, `.product-gallery*`, `.product-configurator*` в
  `src/styles/globals.css`.

### О нас — `/about`

Файл: `src/app/(store)/about/page.tsx`.

Секции: hero с изображением, история магазина, контакты и социальные сети.

Где править:

- Тексты истории и структуру секций: `src/app/(store)/about/page.tsx`.
- Общее описание, контакты и ссылки соцсетей: основная запись `StoreSettings` через
  `src/modules/settings/server/service.ts`.
- Изображение: `public/images/about/about-interior.png`.
- Стили: `.about-*` в `src/styles/globals.css`.

### Вход и регистрация — `/login`

Файл: `src/app/(store)/login/page.tsx`.

Экран состоит из интерьерного изображения и форм входа/регистрации. Вход выполняется через
Credentials Auth.js, регистрация — через Server Action с последующим входом, а восстановление
возвращает одинаковый публичный ответ независимо от существования email. После входа гостевая
корзина атомарно объединяется с persistent-корзиной пользователя.

`/login` является общей точкой входа: администратор без `callbackUrl` переходит в `/admin`, обычный
пользователь — в `/profile`. Безопасный локальный `callbackUrl` возвращает администратора на
запрошенную страницу `/admin/**`; внешний URL отклоняется, а обычный пользователь не может через
callback попасть в административную область.

Где править:

- Изображение и компоновку экрана: `src/app/(store)/login/page.tsx`.
- Изображение: `public/images/auth/login-interior.png`.
- Поля, переключение режимов, сообщения и redirect: `src/modules/auth/components/auth-forms.tsx`.
- Правила валидации: `src/modules/auth/schemas.ts`.
- Backend регистрации и восстановления: `src/modules/auth/server/public-auth.ts` и
  `src/modules/auth/server/actions.ts`.
- Серверные мутации: `src/modules/auth/server/actions.ts`.
- Auth.js-сессию и синхронизацию корзины: `src/modules/auth/session-provider.tsx`.
- Стили: `.auth-*` в `src/styles/globals.css`.

### Личный кабинет — `/profile`

Файл: `src/app/(store)/profile/page.tsx`.

Секции: контактные данные, текущая persistent-корзина, история заказов и состояние Auth.js-сессии.
UI защищённо читает и изменяет собственные `name/email/phone`, получает только собственную корзину
и bounded историю заказов по identity из Auth.js.
Со страницы можно перейти в `/checkout`, `/catalog` или `/login`.

Где править:

- Вводный блок: файл маршрута `profile/page.tsx`.
- Форму контактов, корзину, заказы и кнопки: `src/modules/users/components/profile-dashboard.tsx`.
- Валидацию профиля: `src/modules/users/schemas.ts`.
- Защищённый backend профиля: `src/modules/users/server/profile.ts` и
  `src/modules/users/server/actions.ts`.
- Защищённая история заказов: `src/modules/orders/server/order-read.ts` и
  `src/modules/orders/server/own-orders-action.ts`.
- Клиентскую загрузку и сохранение: `src/modules/users/components/profile-dashboard.tsx`.
- Стили: `.profile-*` в `src/styles/globals.css`.

### Оформление заявки — `/checkout`

Файл: `src/app/(store)/checkout/page.tsx`.

На странице есть хлебные крошки, пояснение, контактная форма, состав корзины и состояние успешной
отправки.

Где править:

- Заголовки и общую компоновку: `src/app/(store)/checkout/page.tsx`.
- Поля, итог заказа и успешное состояние: `src/modules/checkout/components/checkout-form.tsx`.
- Валидацию: `src/modules/checkout/schemas.ts`.
- Клиентский transport создания заказа: `src/modules/checkout/submit-order.ts`.
- Реальный backend создания гостевого заказа: `src/app/api/orders/route.ts` и
  `src/modules/orders/server/order-creation.ts`.
- Стили: `.checkout-*` в `src/styles/globals.css`.

Форма отправляет корзину в `POST /api/orders`, показывает серверный номер и итог только после
успешного commit и очищает корзину только после HTTP `201`. При `409` корзина сохраняется; новую
server-owned цену пользователь должен явно подтвердить перед повторной отправкой.

## Административная часть

Административные страницы не используют публичную шапку. У них собственная боковая навигация в
`src/modules/admin/components/admin-shell.tsx`: «Обзор», «Товары», «Заказы», «Настройки», ссылка
логотипа на `/` и кнопка выхода.

Все административные маршруты проверяют Auth.js session и актуальную роль `ADMIN` на сервере.
Гость перенаправляется на `/login` с локальным `callbackUrl`, пользователь с ролью `USER` видит
отказ в доступе, а отдельной формы входа внутри `/admin/**` нет. Каждая Server Action повторно
выполняет авторизацию.

### Обзор — `/admin`

- Маршрут: `src/app/admin/page.tsx`.
- Метрики PostgreSQL: `src/modules/admin/components/admin-dashboard.tsx`.

### Товары — `/admin/products`

- Маршрут: `src/app/admin/products/page.tsx`.
- Поиск, таблица, создание, редактирование, подписанная загрузка изображений и удаление:
  `src/modules/admin/components/admin-products-manager.tsx`.

### Заказы — `/admin/orders`

- Маршрут: `src/app/admin/orders/page.tsx`.
- Поиск и список: `src/modules/admin/components/admin-orders-manager.tsx`.
- Преобразование DTO и клиентские GET/PATCH-вызовы: `src/modules/admin/orders-transport.ts`.
- Покупатель, состав заказа и смена статуса:
  `src/modules/admin/components/admin-order-details.tsx`.

### Настройки — `/admin/settings`

- Маршрут: `src/app/admin/settings/page.tsx`.
- Название, описание, контакты, адрес и соцсети:
  `src/modules/admin/components/admin-settings-manager.tsx`.
- Защищённый server-only контракт чтения и записи основной DB-записи:
  `src/modules/settings/server/admin.ts`.

Общие места административной части:

- Защищённые Server Actions товаров и настроек: `src/modules/admin/server/actions.ts`.
- Типы и допустимые переходы статусов заказа: `src/modules/admin/types.ts`.
- Валидация форм: `src/modules/admin/schemas.ts`.
- Экран заказов получает первую страницу после серверной проверки Auth.js, а повторную загрузку и
  смену статуса выполняет через защищённые `GET /api/admin/orders` и
  `PATCH /api/admin/orders/[orderNumber]/status`.
- Стили: классы `.admin-*` в `src/styles/globals.css`.

Обзор, товары, заказы и настройки работают через Auth.js, Prisma и PostgreSQL.

## Карта данных и контента

| Что нужно изменить                                         | Основное место                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Пункты desktop-меню                                        | `src/components/layout/header.tsx`                             |
| Пункты мобильного меню                                     | `src/components/layout/mobile-navigation.tsx`                  |
| Название, описание, контакты и соцсети магазина            | `StoreSettings`, `src/modules/settings/server/`                |
| Товары, цены, slug, изображения, варианты и характеристики | Prisma catalog, `src/modules/catalog/server/`                  |
| Периоды и вычисление активных новинок                      | `mock-data.ts`, `src/modules/catalog/new-arrivals.ts`          |
| Какие товары показаны на главной                           | Первые четыре позиции `getPublicCatalog`                       |
| Три преимущества на главной                                | `advantages` в `src/app/(store)/page.tsx`                      |
| Демо-профиль и история заказов                             | `src/modules/users/mock-data.ts`                               |
| Демо-данные админ-панели                                   | `src/modules/admin/mock-data.ts`                               |
| Общие SEO-метаданные                                       | `src/app/layout.tsx`                                           |
| SEO отдельной страницы                                     | `metadata` или `generateMetadata` в соответствующем `page.tsx` |
| Глобальные цвета, шрифты, сетка и адаптивность             | `src/styles/globals.css`                                       |
| Общие кнопки и поля                                        | `src/components/ui/`                                           |
| Общие контейнеры страниц                                   | `src/components/layout/`                                       |

## Быстрый алгоритм корректировки

1. Найдите URL в таблице маршрутов.
2. Откройте соответствующий `page.tsx` и определите имя компонента нужного блока.
3. Если меняется текст, сначала проверьте `mock-data.ts`: часть контента переиспользуется на
   нескольких страницах.
4. Если меняется внешний вид, найдите в JSX значение `className`, затем этот класс в
   `src/styles/globals.css`.
5. Если меняется действие кнопки или формы, откройте компонент из `src/modules/<domain>/components`;
   правила данных обычно находятся рядом в `schemas.ts`, `store.ts`, `queries.ts` или transport-
   файле.
6. После изменения проверьте страницу на desktop и mobile и запустите минимум `npm run lint` и
   `npm run typecheck`; для поведения также запустите связанные Jest/Playwright-тесты.

## Важные ограничения текущей версии

- Главная, каталог, страницы категорий, товара, «О нас», футер, checkout и экран заказов
  админ-панели используют серверные контракты PostgreSQL. Новинки, акции, избранное, корзина,
  публичная авторизация и профиль частично используют демонстрационные данные или mock-transport.
- Поиск в шапке формирует ссылочный запрос `/catalog?search=...`; фильтрация товаров каталога по
  параметру `search` пока не реализована.
- У корзины нет отдельной страницы: она открывается поверх текущего экрана.
- Публичная и мобильная навигация пока содержат отдельные копии списка ссылок.

При расхождении этого документа с кодом источником истины является текущая реализация в `src/app`,
`src/components` и `src/modules`. После добавления нового маршрута или крупного раздела эту карту
следует обновить.

## Категория «Кровати» — `/catalog/beds`

Ссылка «Кровати» в динамической панели каталога ведёт на отдельную страницу категории. На странице
есть описание и ровно три товара: Nubi, Ardea и Linea. Карточки поддерживают переход к товару и
добавление в корзину.

- Маршрут: `src/app/(store)/catalog/beds/page.tsx`.
- Данные категории: `bedCategoryProducts` в `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/beds/`.
- Стили: `.beds-page*` в `src/styles/globals.css`.

## Категория «Матрасы» — `/catalog/mattresses`

Ссылка «Матрасы» в динамической панели каталога ведёт на отдельную страницу категории. На странице
находятся описание подбора матраса и ровно три карточки: Alba, Forma и Noma. Из каждой карточки можно
перейти на общую страницу товара или добавить позицию в корзину.

Где править:

- Маршрут: `src/app/(store)/catalog/mattresses/page.tsx`.
- Состав категории и данные карточек: `mattressCategoryProducts` в
  `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/mattresses/`.
- Ссылка в панели каталога: `src/components/layout/catalog-menu.tsx`.
- Стили: `.mattresses-page*` в `src/styles/globals.css`.

## Категория «Текстиль и декор» — `/catalog/textiles-decor`

Ссылка «Текстиль и декор» в динамической панели каталога ведёт на отдельную страницу категории. На
странице размещены описание направления и ровно три карточки коллекции: плед Lino, подушка Miro и
ваза Sora. Из каждой карточки можно перейти на общую страницу товара или добавить позицию в корзину.

- Маршрут: `src/app/(store)/catalog/textiles-decor/page.tsx`.
- Данные: `textilesDecorCategoryProducts` в `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/textiles-decor/`.
- Ссылка в панели каталога: `src/components/layout/catalog-menu.tsx`.
- Стили: `.textiles-decor-page*` в `src/styles/globals.css`.

## Категория «Столы обеденные» — `/catalog/dining-tables`

Ссылка «Столы обеденные» в динамической панели каталога ведёт на отдельную страницу категории. На
странице размещены описание коллекции и три карточки: Tavola, Orbis и Elara. Кнопка «Подробнее» в
каждой карточке открывает общий динамический маршрут товара.

- Маршрут: `src/app/(store)/catalog/dining-tables/page.tsx`.
- Состав категории и данные товаров: `diningTableCategoryProducts` в `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/dining-tables/`.
- Переход из меню: `src/components/layout/catalog-menu.tsx`.
- Стили: `.dining-tables-page*` в `src/styles/globals.css`.

## Категория «Столы для гостиной» — `/catalog/living-room-tables`

Ссылка «Столы для гостиной» в динамической панели каталога ведёт на отдельную страницу категории. На
странице размещены описание коллекции и ровно три карточки: Riva, Orsa и Plano. Из каждой карточки
можно перейти на общий динамический маршрут товара или добавить позицию в корзину.

- Маршрут: `src/app/(store)/catalog/living-room-tables/page.tsx`.
- Данные: `livingRoomTableCategoryProducts` в `src/modules/catalog/mock-data.ts`.
- Переход из меню: `src/components/layout/catalog-menu.tsx`.
- Стили: `.living-room-tables-page*` в `src/styles/globals.css`.

## Категория «Пуфики» — `/catalog/poufs`

Ссылка «Пуфики» в динамической панели каталога ведёт на отдельную страницу категории. На странице
размещены описание коллекции и три карточки: Arlo, Nola и Taro. Кнопка «Подробнее» в каждой карточке
открывает общий динамический маршрут товара.

- Маршрут: `src/app/(store)/catalog/poufs/page.tsx`.
- Состав категории и данные товаров: `poufCategoryProducts` в `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/poufs/`.
- Переход из меню: `src/components/layout/catalog-menu.tsx`.
- Стили: `.poufs-page*` в `src/styles/globals.css`.

## Категория «Кресла» — `/catalog/armchairs`

Ссылка «Кресла» в динамической панели каталога ведёт на отдельную страницу категории. Страница
объясняет роль кресла в зоне чтения и отдыха и показывает три модели из общего каталога; кнопка
«Подробнее» открывает полноценный маршрут товара `/product/[id]`.

- Маршрут: `src/app/(store)/catalog/armchairs/page.tsx`.
- Данные: `armchairCategoryProducts` и соответствующие товары в `src/modules/catalog/mock-data.ts`.
- Изображения: товарные подпапки в `public/images/armchairs/`.
- Переход из меню: `src/components/layout/catalog-menu.tsx`.
- Стили: `.armchairs-page*` в `src/styles/globals.css`.
