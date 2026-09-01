import { ZodError } from "zod";

import { getCustomerOrder, OrderNotFoundError } from "@/modules/orders/server/order-read";
import { auth } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const order = await getCustomerOrder(await request.json(), session?.user?.id ?? null);
    return Response.json(order);
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error instanceof OrderNotFoundError) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    return Response.json({ error: "Unable to retrieve order" }, { status: 500 });
  }
}
