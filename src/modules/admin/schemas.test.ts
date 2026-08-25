import { describe, expect, it } from "@jest/globals";

import {
  adminLoginSchema,
  adminOrderStatusUpdateSchema,
  adminProductImagesSchema,
  adminProductSchema,
  adminStoreSettingsSchema,
} from "@/modules/admin/schemas";

describe("adminLoginSchema", () => {
  it("accepts the configured preview credentials", () => {
    expect(adminLoginSchema.safeParse({ login: "admin", password: "123" }).success).toBe(true);
  });

  it.each([
    { login: "user", password: "123" },
    { login: "admin", password: "wrong" },
  ])("rejects invalid preview credentials", (credentials) => {
    expect(adminLoginSchema.safeParse(credentials).success).toBe(false);
  });
});

describe("adminStoreSettingsSchema", () => {
  const settings = {
    name: "Virtual Space",
    description: "Мебель для спокойных и продуманных интерьеров.",
    phone: "+375 29 000-00-00",
    email: "hello@virtualspace.example",
    workingHours: "Пн–Пт: 10:00–19:00",
    address: "Минск, улица Примерная, 1",
    instagram: "https://instagram.com/virtualspace",
    pinterest: "",
    telegram: "https://t.me/virtualspace",
  };

  it("accepts complete settings with optional empty social links", () => {
    expect(adminStoreSettingsSchema.safeParse(settings).success).toBe(true);
  });

  it("rejects malformed contact and social data", () => {
    expect(
      adminStoreSettingsSchema.safeParse({ ...settings, email: "wrong", telegram: "t.me/shop" })
        .success,
    ).toBe(false);
  });
});

describe("adminOrderStatusUpdateSchema", () => {
  it("accepts a known status and rejects unknown fields", () => {
    expect(
      adminOrderStatusUpdateSchema.safeParse({ orderId: "VS-24042", status: "confirmed" }).success,
    ).toBe(true);
    expect(
      adminOrderStatusUpdateSchema.safeParse({
        orderId: "VS-24042",
        status: "confirmed",
        total: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(
      adminOrderStatusUpdateSchema.safeParse({ orderId: "VS-24042", status: "paid" }).success,
    ).toBe(false);
  });
});

describe("adminProductSchema", () => {
  const product = {
    name: "Кресло Forma",
    slug: "forma-armchair",
    category: "Кресла",
    description: "Удобное кресло для гостиной",
    price: 1390,
    stock: 7,
    published: true,
  };

  it("accepts a valid product draft", () => {
    expect(adminProductSchema.safeParse(product).success).toBe(true);
  });

  it("rejects unsafe slugs and negative stock", () => {
    expect(
      adminProductSchema.safeParse({ ...product, slug: "Forma Chair", stock: -1 }).success,
    ).toBe(false);
  });

  it("validates image type and size", () => {
    expect(
      adminProductImagesSchema.safeParse([
        new File(["image"], "chair.webp", { type: "image/webp" }),
      ]).success,
    ).toBe(true);
    expect(
      adminProductImagesSchema.safeParse([new File(["text"], "notes.txt", { type: "text/plain" })])
        .success,
    ).toBe(false);
  });
});
