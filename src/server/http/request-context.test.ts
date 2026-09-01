import { describe, expect, it } from "@jest/globals";

import { getRequestId } from "@/server/http/request-context";

describe("request context", () => {
  it("accepts only a bounded safe request id", () => {
    const requestWithId = (value: string) =>
      ({ headers: { get: () => value } }) as unknown as Request;

    expect(getRequestId(requestWithId("safe-id_123"))).toBe("safe-id_123");
    expect(getRequestId(requestWithId("bad\nvalue"))).toMatch(/^[0-9a-f-]{36}$/);
  });
});
