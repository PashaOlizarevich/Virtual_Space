import { describe, expect, it } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

import {
  AdminOrderDetails,
  adminOrderStatusLabels,
} from "@/modules/admin/components/admin-order-details";
import { adminOrdersPreview } from "@/modules/admin/mock-data";

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
