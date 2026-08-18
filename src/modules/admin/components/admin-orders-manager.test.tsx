import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AdminOrderDetails,
  adminOrderStatusLabels,
} from "@/modules/admin/components/admin-order-details";
import { adminOrdersPreview } from "@/modules/admin/mock-data";
import { canTransitionAdminOrderStatus } from "@/modules/admin/types";

describe("AdminOrderDetails", () => {
  it("renders the customer, composition, total and current status", () => {
    const order = adminOrdersPreview[0];
    expect(order).toBeDefined();

    const markup = renderToStaticMarkup(<AdminOrderDetails order={order!} />);

    expect(markup).toContain(order!.id);
    expect(markup).toContain(order!.customer.name);
    expect(markup).toContain(order!.items[0]!.name);
    expect(markup).toContain(adminOrderStatusLabels[order!.status]);
    expect(markup).toContain("Итого");
    expect(markup).toContain('href="mailto:anna@example.com"');
  });
});

describe("admin order status transitions", () => {
  it("allows only forward processing steps or cancellation", () => {
    expect(canTransitionAdminOrderStatus("new", "confirmed")).toBe(true);
    expect(canTransitionAdminOrderStatus("confirmed", "in-progress")).toBe(true);
    expect(canTransitionAdminOrderStatus("in-progress", "completed")).toBe(true);
    expect(canTransitionAdminOrderStatus("in-progress", "cancelled")).toBe(true);
    expect(canTransitionAdminOrderStatus("completed", "in-progress")).toBe(false);
    expect(canTransitionAdminOrderStatus("cancelled", "new")).toBe(false);
  });

  it("renders only allowed actions for the current status", () => {
    const order = adminOrdersPreview[0]!;
    const markup = renderToStaticMarkup(
      <AdminOrderDetails order={order} onStatusChange={() => undefined} />,
    );

    expect(markup).toContain(">Подтверждён<");
    expect(markup).toContain(">Отменён<");
    expect(markup).not.toContain(">Завершён<");
  });
});
