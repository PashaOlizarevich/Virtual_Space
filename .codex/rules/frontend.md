# Frontend

- Используй Next.js App Router и Server Components по умолчанию. Добавляй `"use client"` только для интерактивности, browser API или client hooks.
- Для локального UI-состояния применяй Zustand, для оправданных клиентских запросов — TanStack Query.
- Формы строй на React Hook Form и Zod. Не доверяй данным из localStorage.
- Переиспользуй shadcn/ui и Lucide; не дублируй базовые примитивы.
- Следуй `docs/DESIGN.md`: существующие tokens, Helvetica Neue stack, нейтральная палитра и сдержанная анимация.
- Обеспечь WCAG 2.2 AA, keyboard flow, `focus-visible`, semantic HTML и target area от 44x44px.
- Drawer/dialog управляет focus, закрывается кнопкой, overlay и Escape и возвращает focus.
- Не показывай вымышленные рейтинги, отзывы или данные товаров.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->