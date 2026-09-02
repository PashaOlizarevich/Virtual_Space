-- Insert the required public store profile without overwriting operator-managed settings.
INSERT INTO "StoreSettings" (
    "key",
    "name",
    "description",
    "contacts",
    "socials",
    "createdAt",
    "updatedAt"
)
VALUES (
    'primary',
    'Virtual Space',
    'Мы собираем мебель для спокойных, продуманных интерьеров — с честными материалами, ясными формами и вниманием к повседневной жизни.',
    '[{"label":"Шоурум","value":"Минск, посещение по предварительной записи"},{"label":"Телефон","value":"+375 (29) 000-00-00","href":"tel:+375290000000"},{"label":"Почта","value":"hello@virtualspace.example","href":"mailto:hello@virtualspace.example"},{"label":"Часы работы","value":"Пн–Пт: 10:00–19:00 · Сб–Вс: 11:00–17:00"}]'::JSONB,
    '[{"label":"Instagram","href":"https://www.instagram.com/virtualspace"},{"label":"Pinterest","href":"https://www.pinterest.com/virtualspace"},{"label":"Telegram","href":"https://t.me/virtualspace"}]'::JSONB,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
