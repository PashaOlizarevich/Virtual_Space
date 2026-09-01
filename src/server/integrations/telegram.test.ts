import { afterEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("server-only", () => ({}));

import { notifyAdminOfCreatedOrder } from "@/server/integrations/telegram";

const order = {
  orderNumber: "VS-TESTORDER001",
  total: { amount: "2780.00", currency: "BYN" as const },
  status: "NEW" as const,
};

const originalToken = process.env.TELEGRAM_BOT_TOKEN;
const originalChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

afterEach(() => {
  if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
  else process.env.TELEGRAM_BOT_TOKEN = originalToken;
  if (originalChatId === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  else process.env.TELEGRAM_ADMIN_CHAT_ID = originalChatId;
});

describe("Telegram order notification adapter", () => {
  it("sends a minimal admin message without customer contact data", async () => {
    process.env.TELEGRAM_BOT_TOKEN = `123456:${"a".repeat(32)}`;
    process.env.TELEGRAM_ADMIN_CHAT_ID = "-1001234567890";
    const request = jest.fn<typeof fetch>(
      async () =>
        ({ ok: true, json: async () => ({ ok: true, result: { message_id: 1 } }) }) as Response,
    );

    await expect(notifyAdminOfCreatedOrder(order, request)).resolves.toBeUndefined();

    expect(request).toHaveBeenCalledTimes(1);
    const [url, init] = request.mock.calls[0];
    expect(url).toBe(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`);
    expect(init).toEqual(
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      chat_id: "-1001234567890",
      text: "Новый заказ Virtual Space\nНомер: VS-TESTORDER001\nСумма: 2780.00 BYN\nСтатус: NEW",
    });
    expect(String(init?.body)).not.toContain("email");
    expect(String(init?.body)).not.toContain("phone");
  });

  it("rejects invalid configuration before making an external request", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "invalid-token";
    process.env.TELEGRAM_ADMIN_CHAT_ID = "admin";
    const request = jest.fn<typeof fetch>();

    await expect(notifyAdminOfCreatedOrder(order, request)).rejects.toBeDefined();
    expect(request).not.toHaveBeenCalled();
  });
});
