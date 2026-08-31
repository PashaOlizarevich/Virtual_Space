import { ZodError, z } from "zod";

import { createImageUploadSignature } from "@/modules/catalog/server/admin";
import { AdminAccessRequiredError, AuthenticationRequiredError } from "@/server/admin-auth";

export const runtime = "nodejs";

const requestSchema = z.strictObject({ productId: z.string().regex(/^[1-9]\d*$/) });

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    return Response.json(await createImageUploadSignature(input.productId));
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error instanceof AdminAccessRequiredError) {
      return Response.json({ error: "Administrator access required" }, { status: 403 });
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    return Response.json({ error: "Unable to create upload signature" }, { status: 500 });
  }
}
