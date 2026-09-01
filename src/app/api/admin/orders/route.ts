import { getAdminOrders } from "@/modules/orders/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return runRouteBoundary(
    {
      operation: "admin.order.list",
      internalErrorMessage: "Unable to retrieve orders",
      request,
    },
    async ({ json }) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const input = {
          cursor: searchParams.get("cursor") ?? undefined,
          limit: searchParams.get("limit") ?? undefined,
        };
        return json(await getAdminOrders(input));
      } catch (error) {
        if (error instanceof AuthenticationRequiredError) {
          return json({ error: "Authentication required" }, { status: 401 });
        }
        if (error instanceof AdminAccessRequiredError) {
          return json({ error: "Administrator access required" }, { status: 403 });
        }
        throw error;
      }
    },
  );
}
