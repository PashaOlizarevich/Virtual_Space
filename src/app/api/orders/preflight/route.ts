import { ZodError } from "zod";

import { preflightGuestCheckout } from "@/modules/orders/server/checkout-preflight";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const result = await preflightGuestCheckout(await request.json());

    return Response.json(result, { status: result.status === "CONFLICT" ? 409 : 200 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    return Response.json({ error: "Unable to validate cart" }, { status: 500 });
  }
}
