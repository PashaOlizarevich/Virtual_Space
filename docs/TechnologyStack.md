Финальный стек нашего интернет-магазина мебели FRONTEND Основные: Next.js React TypeScript Tailwind CSS UI / дизайн: shadcn/ui Radix UI Lucide React Framer Motion Состояние приложения: Zustand  
Используем для:  
корзины; избранного; состояния интерфейса. Формы: React Hook Form Zod  
Используем для:  
оформления заказа; авторизации; добавления товаров через админку. Работа с данными: TanStack Query  
Используем для:  
загрузки товаров; обновления данных; кеширования запросов. BACKEND Основные: Next.js API Routes Server Actions Node.js Работа с базой: Prisma ORM Авторизация: Auth.js (NextAuth)  
Для:  
администратора; пользователей; ролей доступа. DATABASE PostgreSQL  
Таблицы:  
Products Users Orders Cart Settings ХРАНЕНИЕ ИЗОБРАЖЕНИЙ  
Для мебели это обязательно:  
Cloudinary  
Используется для:  
фотографий товаров; галереи; изображений интерьеров. ADMIN PANEL  
Технологии:  
Next.js React TypeScript Prisma React Hook Form Zod  
Функции:  
добавление товара; редактирование; удаление; управление заказами; изменение информации магазина. УВЕДОМЛЕНИЯ Telegram Bot API  
Для:  
уведомления администратора о новых заказах. AI (будущее развитие)  
Так как проект связан с мебелью, AI сюда хорошо подходит:  
OpenAI API LLM AI Assistant  
Функции:  
подбор мебели; помощь покупателю; рекомендации товаров; ответы на вопросы. DEPLOY / ПРОДАКШН Git GitHub Vercel Docker (опционально) КАЧЕСТВО КОДА ESLint Prettier Jest Playwright Итоговый стек для нашего проекта: Frontend: Next.js React TypeScript Tailwind CSS shadcn/ui Zustand React Hook Form Zod TanStack Query Framer Motion  
Backend: Next.js API Routes Server Actions Node.js Prisma Auth.js  
Database: PostgreSQL  
Storage: Cloudinary  
Admin: Next.js Admin Panel  
Notifications: Telegram Bot API  
AI: OpenAI API  
Deployment: Git GitHub Vercel Docker