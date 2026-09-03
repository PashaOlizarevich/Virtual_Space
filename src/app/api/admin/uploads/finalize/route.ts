import { z } from "zod";

import { finalizeImageUpload } from "@/modules/catalog/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

const requestSchema = z.strictObject({
  productId: z.string().regex(/^[1-9]\d*$/),
  publicId: z.string().regex(/^virtual-space\/products\/[1-9]\d*\/[0-9a-f-]{36}$/),
  alt: z.string().trim().min(1).max(300),
  position: z.number().int().min(0).max(10_000),
});

export async function POST(request: Request) {
  return runRouteBoundary(
    {
      operation: "admin.upload.finalize",
      internalErrorMessage: "Unable to finalize image upload",
      request,
      rateLimit: { scope: "admin-upload-finalize", limit: 30, windowMs: 60_000 },
    },
    async ({ json }) => {
      try {
        const input = requestSchema.parse(await request.json());
        return json(await finalizeImageUpload(input));
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
