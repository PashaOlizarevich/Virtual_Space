import { afterEach, describe, expect, it, jest } from "@jest/globals";

import { logUnexpectedError } from "@/server/http/safe-logger";

describe("safe logger", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs correlation metadata without the error message or stack", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => undefined);

    logUnexpectedError(new Error("password=secret database-host"), {
      requestId: "request-123",
      operation: "test.operation",
      method: "POST",
      path: "/api/test",
    });

    expect(log).toHaveBeenCalledWith("server_request_failed", {
      requestId: "request-123",
      operation: "test.operation",
      method: "POST",
      path: "/api/test",
      errorType: "Error",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("password=secret");
  });
});
