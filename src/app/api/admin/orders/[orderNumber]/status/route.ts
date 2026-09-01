import { ZodError } from "zod";

import { updateAdminOrderStatus } from "@/modules/orders/server/admin-status";
import {
  ConcurrentOrderStatusUpdateError,
  OrderStatusUpdateNotFoundError,
} from "@/modules/orders/server/order-status-update";
import { InvalidOrderStatusTransitionError } from "@/modules/orders/server/status-transitions";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const [{ orderNumber }, body] = await Promise.all([context.params, request.json()]);
    const input =
      typeof body === "object" && body !== null && !Array.isArray(body)
        ? { ...body, orderNumber }
        : body;
    return Response.json(await updateAdminOrderStatus(input));
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error instanceof AdminAccessRequiredError) {
      return Response.json({ error: "Administrator access required" }, { status: 403 });
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error instanceof OrderStatusUpdateNotFoundError) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    if (
      error instanceof InvalidOrderStatusTransitionError ||
      error instanceof ConcurrentOrderStatusUpdateError
    ) {
      return Response.json({ error: "Order status conflict" }, { status: 409 });
    }
    return Response.json({ error: "Unable to update order status" }, { status: 500 });
  }
}
