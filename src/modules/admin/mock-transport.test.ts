import { beforeAll, describe, expect, it } from "@jest/globals";

beforeAll(() => {
  globalThis.structuredClone ??= <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
});

describe("updateAdminOrderStatusPreview", () => {
  it("rejects a transition from a final status", async () => {
    const { updateAdminOrderStatusPreview } = await import("@/modules/admin/mock-transport");

    await expect(
      updateAdminOrderStatusPreview({ orderId: "VS-23998", status: "in-progress" }),
    ).rejects.toThrow("Этот переход статуса недоступен");
  });

  it("rejects an unknown order", async () => {
    const { updateAdminOrderStatusPreview } = await import("@/modules/admin/mock-transport");

    await expect(
      updateAdminOrderStatusPreview({ orderId: "VS-unknown", status: "cancelled" }),
    ).rejects.toThrow("Заказ не найден");
  });
});
