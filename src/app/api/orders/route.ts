import { ZodError } from "zod";

import {
  createGuestOrder,
  OrderCreationConflictError,
} from "@/modules/orders/server/order-creation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const order = await createGuestOrder(await request.json());

    return Response.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    if (error instanceof OrderCreationConflictError) {
      return Response.json({ status: "CONFLICT", issues: error.issues }, { status: 409 });
    }

    return Response.json({ error: "Unable to create order" }, { status: 500 });
  }
}
