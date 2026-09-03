import { z } from "zod";

import { createImageUploadSignature } from "@/modules/catalog/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";
import { runRouteBoundary } from "@/server/http/route-boundary";

export const runtime = "nodejs";

const requestSchema = z.strictObject({ productId: z.string().regex(/^[1-9]\d*$/) });

export async function POST(request: Request) {
  return runRouteBoundary(
    {
      operation: "admin.upload-signature.create",
      internalErrorMessage: "Unable to create upload signature",
      request,
      rateLimit: { scope: "admin-upload-signature", limit: 30, windowMs: 60_000 },
    },
    async ({ json }) => {
      try {
        const input = requestSchema.parse(await request.json());
        const { public_id: _publicId, ...signature } = await createImageUploadSignature(
          input.productId,
        );
        void _publicId;
        return json(signature);
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
