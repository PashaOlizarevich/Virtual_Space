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

| URL                   | Экран                | Файл маршрута                           | Главный компонент или источник                       |
| --------------------- | -------------------- | --------------------------------------- | ---------------------------------------------------- |
| `/`                   | Главная              | `src/app/(store)/page.tsx`              | `ProductPreview`, `featuredProducts`, `storeProfile` |
| `/catalog`            | Каталог              | `src/app/(store)/catalog/page.tsx`      | `CatalogQueryGrid`                                   |
| `/product/<slug>`     | Карточка товара      | `src/app/(store)/product/[id]/page.tsx` | `ProductGallery`, `ProductConfigurator`              |
| `/about`              | О магазине           | `src/app/(store)/about/page.tsx`        | `storeProfile`                                       |
| `/login`              | Вход и регистрация   | `src/app/(store)/login/page.tsx`        | `AuthForms`                                          |
| `/profile`            | Личный кабинет       | `src/app/(store)/profile/page.tsx`      | `ProfileDashboard`                                   |
| `/checkout`           | Оформление заявки    | `src/app/(store)/checkout/page.tsx`     | `CheckoutForm`                                       |
| `/admin`              | Обзор администратора | `src/app/admin/page.tsx`                | `AdminGate`, `AdminDashboard`                        |
| `/admin/products`     | Управление товарами  | `src/app/admin/products/page.tsx`       | `AdminProductsGate`, `AdminProductsManager`          |
| `/admin/orders`       | Управление заказами  | `src/app/admin/orders/page.tsx`         | `AdminOrdersGate`, `AdminOrdersManager`              |
| `/admin/settings`     | Настройки магазина   | `src/app/admin/settings/page.tsx`       | `AdminSettingsGate`, `AdminSettingsManager`          |
| Любой неизвестный URL | Страница 404         | `src/app/not-found.tsx`                 | `FeedbackState`                                      |

## Общая оболочка публичного сайта

### Корневой layout

`src/app/layout.tsx` подключает глобальные метаданные, провайдеры, общие стили, skip-link и анимацию
перехода между маршрутами.

- Общий `<title>` и описание сайта: `src/app/layout.tsx`.
- Клиентские провайдеры каталога, корзины и preview-сессии: `src/app/providers.tsx`.
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
  личного кабинета и корзины. «Каталог», «Новинки» и «Акции» ведут в существующий каталог,
  «Магазины» — к контактам шоурума на странице «О нас»; переход на главную доступен через логотип.
  Массив ссылок `navigationItems` находится в `header.tsx`.
- Логотип `VIRTUAL SPACE` ведёт на `/`. Текст и анимационные задержки букв находятся в
  `header.tsx`.
- Кнопка поиска сейчас только отображается и не открывает поиск.
- Иконка пользователя ведёт на `/login`.
- Иконка корзины открывает drawer-компонент
  `src/modules/cart/components/cart-widget.tsx`.
- Мобильное меню, его ссылки, переход в `/profile` и открытие корзины находятся в
  `src/components/layout/mobile-navigation.tsx`.
- Стили шапки ищите по `.header`, `.header__*`; мобильного меню — по `.mobile-navigation*` в
  `src/styles/globals.css`.

Важно: desktop- и mobile-меню используют отдельные массивы `navigationItems`. Мобильное меню также
повторяет пять пунктов desktop-навигации, поэтому при изменении навигации нужно проверять оба массива.

### Корзина

Корзина не имеет отдельного URL: это выезжающая панель из шапки.

- Разметка, изменение количества, удаление позиции, итог и ссылки на товар/оформление:
  `src/modules/cart/components/cart-widget.tsx`.
- Состояние корзины и сохранение в браузере: `src/modules/cart/store.ts`.
- Проверка актуальности позиции: `src/modules/cart/validation.ts`.
- Preview-синхронизация: `src/modules/cart/sync.ts` и `src/modules/cart/mock-transport.ts`.
- Типы: `src/modules/cart/types.ts`.
- Стили: классы `.cart-widget*` в `src/styles/globals.css`.

## Публичные страницы

### Главная — `/`

Файл: `src/app/(store)/page.tsx`.

Экран идёт сверху вниз:

1. Hero с главным заголовком, фоновым изображением и кнопкой «Смотреть коллекцию». Кнопка ведёт к
   якорю `#showcase` на этой же странице.
2. «Избранное для вашего дома» — сетка карточек `ProductPreview`.
3. «Почему Virtual Space» — три преимущества из локального массива `advantages`.
4. Контактный блок «Давайте создадим пространство вместе».

Где править:

- Композицию, заголовки, преимущества и hero: `src/app/(store)/page.tsx`.
- Hero-изображение: `public/images/home/hero-v2.png`; его путь также задан в `page.tsx`.
- Карточку товара и быстрый просмотр: `src/modules/catalog/components/product-preview.tsx`.
- Товары на главной: `featuredProducts` в `src/modules/catalog/mock-data.ts`.
- Описание магазина и контакты: `src/modules/settings/mock-data.ts`.
- Стили: `.home-*` и `.product-preview*` в `src/styles/globals.css`.

### Каталог — `/catalog`

Файл: `src/app/(store)/catalog/page.tsx`.

На странице находятся вводный заголовок и сетка товаров. Загрузка, состояние ошибки, повторный
запрос и пустой результат управляются компонентом `CatalogQueryGrid`.

Где править:

- Заголовок и описание страницы: `src/app/(store)/catalog/page.tsx`.
- Получение и состояния списка: `src/modules/catalog/components/catalog-query-grid.tsx`.
- Вид карточки, кнопки «Подробнее», «В корзину» и быстрый просмотр:
  `src/modules/catalog/components/product-preview.tsx`.
- Список товаров, цены, изображения и slug: `src/modules/catalog/mock-data.ts`.
- Настройку клиентского запроса: `src/modules/catalog/queries.ts`.
- Структуру товара: `src/modules/catalog/types.ts`.
- Стили: `.catalog-page*` и `.product-preview*` в `src/styles/globals.css`.

### Страница товара — `/product/<slug>`

Файл: `src/app/(store)/product/[id]/page.tsx`. Пример адреса: `/product/forma-chair`. Значение
`<slug>` берётся из поля `slug` товара в `src/modules/catalog/mock-data.ts`.

На странице находятся хлебные крошки, галерея, название и описание, выбор конфигурации, добавление
в корзину и характеристики. Неизвестный slug открывает страницу 404.

Где править:

- Общую компоновку и хлебные крошки: файл маршрута `[id]/page.tsx`.
- Галерею: `src/modules/catalog/components/product-gallery.tsx`.
- Цена, варианты, количество и добавление в корзину:
  `src/modules/catalog/components/product-configurator.tsx`.
- Контент конкретного товара: `src/modules/catalog/mock-data.ts`.
- Изображения товаров: пути, указанные в `mock-data.ts` (сейчас используются внешние URL).
- Стили: `.product-detail*`, `.product-gallery*`, `.product-configurator*` в
  `src/styles/globals.css`.

### О нас — `/about`

Файл: `src/app/(store)/about/page.tsx`.

Секции: hero с изображением, история магазина, контакты и социальные сети.

Где править:

- Тексты истории и структуру секций: `src/app/(store)/about/page.tsx`.
- Общее описание, контакты и ссылки соцсетей: `src/modules/settings/mock-data.ts`.
- Изображение: `public/images/about/about-interior.png`.
- Стили: `.about-*` в `src/styles/globals.css`.

### Вход и регистрация — `/login`

Файл: `src/app/(store)/login/page.tsx`.

Экран состоит из интерьерного изображения и форм входа/регистрации. После успешной preview-
авторизации пользователь переходит на `/profile`.

Где править:

- Изображение и компоновку экрана: `src/app/(store)/login/page.tsx`.
- Изображение: `public/images/auth/login-interior.png`.
- Поля, переключение режимов, сообщения и redirect: `src/modules/auth/components/auth-forms.tsx`.
- Правила валидации: `src/modules/auth/schemas.ts`.
- Демонстрационную отправку формы: `src/modules/auth/mock-transport.ts`.
- Preview-сессию: `src/modules/auth/session-provider.tsx`.
- Стили: `.auth-*` в `src/styles/globals.css`.

### Личный кабинет — `/profile`

Файл: `src/app/(store)/profile/page.tsx`.

Секции: контактные данные, текущая корзина, история заказов и состояние preview-сессии. Со страницы
можно перейти в `/checkout`, `/catalog` или `/login`.

Где править:

- Вводный блок: файл маршрута `profile/page.tsx`.
- Форму контактов, корзину, заказы и кнопки: `src/modules/users/components/profile-dashboard.tsx`.
- Демонстрационные профиль и заказы: `src/modules/users/mock-data.ts`.
- Валидацию профиля: `src/modules/users/schemas.ts`.
- Демонстрационное сохранение: `src/modules/users/mock-transport.ts`.
- Стили: `.profile-*` в `src/styles/globals.css`.

### Оформление заявки — `/checkout`

Файл: `src/app/(store)/checkout/page.tsx`.

На странице есть хлебные крошки, пояснение, контактная форма, состав корзины и состояние успешной
отправки.

Где править:

- Заголовки и общую компоновку: `src/app/(store)/checkout/page.tsx`.
- Поля, итог заказа и успешное состояние: `src/modules/checkout/components/checkout-form.tsx`.
- Валидацию: `src/modules/checkout/schemas.ts`.
- Preview-отправку заказа: `src/modules/checkout/submit-order.ts`.
- Стили: `.checkout-*` в `src/styles/globals.css`.

## Административная часть

Административные страницы не используют публичную шапку. У них собственная боковая навигация в
`src/modules/admin/components/admin-shell.tsx`: «Обзор», «Товары», «Заказы», «Настройки», ссылка
логотипа на `/` и кнопка выхода.

Перед содержимым каждого экрана стоит preview-gate. Сессия администратора находится в
`src/modules/admin/session-provider.tsx`, форма входа — в
`src/modules/admin/components/admin-login-form.tsx`.

### Обзор — `/admin`

- Маршрут: `src/app/admin/page.tsx`.
- Проверка preview-сессии: `src/modules/admin/components/admin-gate.tsx`.
- Метрики и последняя активность: `src/modules/admin/components/admin-dashboard.tsx`.

### Товары — `/admin/products`

- Маршрут: `src/app/admin/products/page.tsx`.
- Gate: `src/modules/admin/components/admin-products-gate.tsx`.
- Поиск, таблица, создание, редактирование, изображения и удаление:
  `src/modules/admin/components/admin-products-manager.tsx`.

### Заказы — `/admin/orders`

- Маршрут: `src/app/admin/orders/page.tsx`.
- Gate: `src/modules/admin/components/admin-orders-gate.tsx`.
- Поиск и список: `src/modules/admin/components/admin-orders-manager.tsx`.
- Покупатель, состав заказа и смена статуса:
  `src/modules/admin/components/admin-order-details.tsx`.

### Настройки — `/admin/settings`

- Маршрут: `src/app/admin/settings/page.tsx`.
- Gate: `src/modules/admin/components/admin-settings-gate.tsx`.
- Название, описание, контакты, адрес и соцсети:
  `src/modules/admin/components/admin-settings-manager.tsx`.

Общие места административной части:

- Демонстрационные данные: `src/modules/admin/mock-data.ts`.
- Типы и допустимые переходы статусов заказа: `src/modules/admin/types.ts`.
- Валидация форм: `src/modules/admin/schemas.ts`.
- Имитация загрузки и сохранения: `src/modules/admin/mock-transport.ts`.
- Стили: классы `.admin-*` в `src/styles/globals.css`.

Изменения в административных настройках пока хранятся только в preview-слое и не обновляют
публичные страницы. Реальные Auth.js, API и PostgreSQL ещё не подключены к этим сценариям.

## Карта данных и контента

| Что нужно изменить                                         | Основное место                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Пункты desktop-меню                                        | `src/components/layout/header.tsx`                             |
| Пункты мобильного меню                                     | `src/components/layout/mobile-navigation.tsx`                  |
| Название, описание, контакты и соцсети магазина            | `src/modules/settings/mock-data.ts`                            |
| Товары, цены, slug, изображения, варианты и характеристики | `src/modules/catalog/mock-data.ts`                             |
| Какие товары показаны на главной                           | `featuredProducts` в `src/modules/catalog/mock-data.ts`        |
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

- Каталог, авторизация, профиль, checkout и админ-панель используют демонстрационные данные или
  mock-transport; это ещё не полноценные production API и база данных.
- Поиск в шапке визуально присутствует, но его действие не реализовано.
- У корзины нет отдельной страницы: она открывается поверх текущего экрана.
- Публичная и мобильная навигация пока содержат отдельные копии списка ссылок.
- Footer в фактически реализованной публичной оболочке отсутствует.

При расхождении этого документа с кодом источником истины является текущая реализация в `src/app`,
`src/components` и `src/modules`. После добавления нового маршрута или крупного раздела эту карту
следует обновить.
