import "server-only";

import { ZodError } from "zod";

import { getRequestId, jsonWithRequestId } from "@/server/http/request-context";
import { checkRateLimit } from "@/server/http/rate-limit";
import { logUnexpectedError } from "@/server/http/safe-logger";

type RouteRateLimit = Readonly<{ scope: string; limit: number; windowMs: number }>;
type RouteBoundaryOptions = Readonly<{
  internalErrorMessage: string;
  operation: string;
  request: Request;
  rateLimit?: RouteRateLimit;
}>;

export type RouteContext = Readonly<{
  requestId: string;
  json: (body: unknown, init?: ResponseInit) => Response;
}>;

export class InvalidRequestError extends Error {}

export async function runRouteBoundary(
  options: RouteBoundaryOptions,
  handler: (context: RouteContext) => Promise<Response>,
): Promise<Response> {
  const requestId = getRequestId(options.request);
  const json = (body: unknown, init?: ResponseInit) => jsonWithRequestId(body, requestId, init);

  if (options.rateLimit) {
    const result = checkRateLimit(options.request, options.rateLimit.scope, options.rateLimit);
    if (!result.allowed) {
      return json(
        { error: "Too many requests" },
        { status: 429, headers: { "retry-after": String(result.retryAfterSeconds) } },
      );
    }
  }

  try {
    return await handler({ requestId, json });
  } catch (error) {
    if (
      error instanceof ZodError ||
      error instanceof SyntaxError ||
      error instanceof InvalidRequestError
    ) {
      return json({ error: "Invalid request" }, { status: 400 });
    }

    logUnexpectedError(error, {
      requestId,
      operation: options.operation,
      method: options.request.method,
      path: safePath(options.request.url),
    });
    return json({ error: options.internalErrorMessage }, { status: 500 });
  }
}

function safePath(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}
