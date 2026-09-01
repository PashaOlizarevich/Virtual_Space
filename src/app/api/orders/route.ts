import {
  createGuestOrder,
  OrderCreationConflictError,
} from "@/modules/orders/server/order-creation";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return runRouteBoundary(
    {
      operation: "order.create",
      internalErrorMessage: "Unable to create order",
      request,
      rateLimit: { scope: "order-create", limit: 10, windowMs: 60_000 },
    },
    async ({ json }) => {
      try {
        return json(await createGuestOrder(await request.json()), { status: 201 });
      } catch (error) {
        if (error instanceof OrderCreationConflictError) {
          return json({ status: "CONFLICT", issues: error.issues }, { status: 409 });
        }
        throw error;
      }
    },
  );
}
