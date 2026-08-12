# Frontend

- Используй Next.js App Router и Server Components по умолчанию. Добавляй `"use client"` только для интерактивности, browser API или client hooks.
- Для локального UI-состояния применяй Zustand, для оправданных клиентских запросов — TanStack Query.
- Формы строй на React Hook Form и Zod. Не доверяй данным из localStorage.
- Переиспользуй shadcn/ui и Lucide; не дублируй базовые примитивы.
- Следуй `DESIGN.md`: существующие tokens, Helvetica Neue stack, нейтральная палитра и сдержанная анимация.
- Обеспечь WCAG 2.2 AA, keyboard flow, `focus-visible`, semantic HTML и target area от 44x44px.
- Drawer/dialog управляет focus, закрывается кнопкой, overlay и Escape и возвращает focus.
- Не показывай вымышленные рейтинги, отзывы или данные товаров.
