import { preflightGuestCheckout } from "@/modules/orders/server/checkout-preflight";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return runRouteBoundary(
    {
      operation: "order.preflight",
      internalErrorMessage: "Unable to validate cart",
      request,
      rateLimit: { scope: "order-preflight", limit: 30, windowMs: 60_000 },
    },
    async ({ json }) => {
      const result = await preflightGuestCheckout(await request.json());
      return json(result, { status: result.status === "CONFLICT" ? 409 : 200 });
    },
  );
}
