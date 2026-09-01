import "server-only";

import { randomUUID } from "node:crypto";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

export function getRequestId(request: Request): string {
  const candidate = request.headers?.get?.("x-request-id")?.trim();
  return candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID();
}

export function jsonWithRequestId(body: unknown, requestId: string, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("x-request-id", requestId);
  return Response.json(body, { ...init, headers });
}
