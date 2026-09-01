import { describe, expect, it } from "@jest/globals";

import { mapAdminOrderPage } from "@/modules/admin/orders-transport";

describe("admin orders transport", () => {
  it("maps the allowlisted PostgreSQL DTO to the existing admin view model", () => {
    const [order] = mapAdminOrderPage({
      orders: [
        {
          orderNumber: "VS-ORDER42",
          status: "IN_PROGRESS",
          total: { amount: "2500.00", currency: "BYN" },
          createdAt: "2026-09-01T10:00:00.000Z",
          updatedAt: "2026-09-01T11:00:00.000Z",
          customer: {
            name: "Анна",
            email: "anna@example.com",
            phone: "+375290000000",
            comment: null,
          },
          items: [
            {
              id: "1",
              name: "Кресло",
              selectedOptions: [
                {
                  groupId: "fabric",
                  groupLabel: "Ткань",
                  optionId: "graphite",
                  optionLabel: "Графит",
                },
              ],
              unitPrice: { amount: "1250.00", currency: "BYN" },
              quantity: 2,
              lineTotal: { amount: "2500.00", currency: "BYN" },
            },
          ],
        },
      ],
      nextCursor: null,
    });

    expect(order).toMatchObject({
      id: "VS-ORDER42",
      status: "in-progress",
      total: 2500,
      items: [{ configuration: "Графит", unitPrice: 1250 }],
    });
  });
});
