import { getCustomerOrder, OrderNotFoundError } from "@/modules/orders/server/order-read";
import { auth } from "@/server/auth";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return runRouteBoundary(
    {
      operation: "order.lookup",
      internalErrorMessage: "Unable to retrieve order",
      request,
      rateLimit: { scope: "order-lookup", limit: 20, windowMs: 60_000 },
    },
    async ({ json }) => {
      try {
        const session = await auth();
        const order = await getCustomerOrder(await request.json(), session?.user?.id ?? null);
        return json(order);
      } catch (error) {
        if (error instanceof OrderNotFoundError) {
          return json({ error: "Order not found" }, { status: 404 });
        }
        throw error;
      }
    },
  );
}
