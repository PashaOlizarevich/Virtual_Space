import { updateAdminOrderStatus } from "@/modules/orders/server/admin-status";
import {
  ConcurrentOrderStatusUpdateError,
  OrderStatusUpdateNotFoundError,
} from "@/modules/orders/server/order-status-update";
import { InvalidOrderStatusTransitionError } from "@/modules/orders/server/status-transitions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  return runRouteBoundary(
    {
      operation: "admin.order.status-update",
      internalErrorMessage: "Unable to update order status",
      request,
      rateLimit: { scope: "admin-order-status", limit: 60, windowMs: 60_000 },
    },
    async ({ json }) => {
      try {
        const [{ orderNumber }, body] = await Promise.all([context.params, request.json()]);
        const input =
          typeof body === "object" && body !== null && !Array.isArray(body)
            ? { ...body, orderNumber }
            : body;
        return json(await updateAdminOrderStatus(input));
      } catch (error) {
        if (error instanceof AuthenticationRequiredError) {
          return json({ error: "Authentication required" }, { status: 401 });
        }
        if (error instanceof AdminAccessRequiredError) {
          return json({ error: "Administrator access required" }, { status: 403 });
        }
        if (error instanceof OrderStatusUpdateNotFoundError) {
          return json({ error: "Order not found" }, { status: 404 });
        }
        if (
          error instanceof InvalidOrderStatusTransitionError ||
          error instanceof ConcurrentOrderStatusUpdateError
        ) {
          return json({ error: "Order status conflict" }, { status: 409 });
        }
        throw error;
      }
    },
  );
}
