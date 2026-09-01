import "server-only";

import { z } from "zod";

const TELEGRAM_API_BASE_URL = "https://api.telegram.org";
const TELEGRAM_REQUEST_TIMEOUT_MS = 5_000;

const telegramConfigSchema = z.strictObject({
  botToken: z
    .string()
    .trim()
    .regex(/^\d+:[A-Za-z0-9_-]{20,}$/),
  adminChatId: z
    .string()
    .trim()
    .regex(/^-?\d+$/),
});

const telegramSuccessSchema = z.object({ ok: z.literal(true) });

type TelegramFetch = typeof fetch;
type TelegramOrderNotification = Readonly<{
  orderNumber: string;
  total: Readonly<{ amount: string; currency: string }>;
  status: string;
}>;

function getTelegramConfig() {
  return telegramConfigSchema.parse({
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID,
  });
}

function formatCreatedOrderMessage(order: TelegramOrderNotification): string {
  return [
    "Новый заказ Virtual Space",
    `Номер: ${order.orderNumber}`,
    `Сумма: ${order.total.amount} ${order.total.currency}`,
    `Статус: ${order.status}`,
  ].join("\n");
}

export async function notifyAdminOfCreatedOrder(
  order: TelegramOrderNotification,
  request: TelegramFetch = fetch,
): Promise<void> {
  const config = getTelegramConfig();
  const response = await request(`${TELEGRAM_API_BASE_URL}/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: config.adminChatId,
      text: formatCreatedOrderMessage(order),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TELEGRAM_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error("Telegram notification request failed");
  telegramSuccessSchema.parse(await response.json());
}
