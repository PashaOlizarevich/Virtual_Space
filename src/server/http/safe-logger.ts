import "server-only";

type ErrorLogContext = Readonly<{
  requestId: string;
  operation: string;
  method?: string;
  path?: string;
}>;

export function logUnexpectedError(error: unknown, context: ErrorLogContext): void {
  const errorType = error instanceof Error ? error.name : "UnknownError";

  console.error("server_request_failed", {
    requestId: context.requestId,
    operation: context.operation,
    method: context.method,
    path: context.path,
    errorType,
  });
}
