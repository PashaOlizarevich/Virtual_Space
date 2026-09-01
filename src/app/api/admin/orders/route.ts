import { ZodError } from "zod";

import { getAdminOrders } from "@/modules/orders/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const input = {
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    };
    return Response.json(await getAdminOrders(input));
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error instanceof AdminAccessRequiredError) {
      return Response.json({ error: "Administrator access required" }, { status: 403 });
    }
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    return Response.json({ error: "Unable to retrieve orders" }, { status: 500 });
  }
}
