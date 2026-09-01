import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  checkRateLimit,
  checkRateLimitKey,
  resetRateLimitsForTests,
} from "@/server/http/rate-limit";

describe("rate limit", () => {
  beforeEach(resetRateLimitsForTests);

  it("limits a client within a scope and resets after the window", () => {
    const request = {
      headers: { get: (name: string) => (name === "x-forwarded-for" ? "192.0.2.10" : null) },
    } as unknown as Request;
    const policy = { limit: 2, windowMs: 1_000 };

    expect(checkRateLimit(request, "test", policy, 1_000)).toEqual({ allowed: true });
    expect(checkRateLimit(request, "test", policy, 1_100)).toEqual({ allowed: true });
    expect(checkRateLimit(request, "test", policy, 1_200)).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
    expect(checkRateLimit(request, "test", policy, 2_000)).toEqual({ allowed: true });
  });

  it("supports a pre-redacted identifier for non-HTTP authentication boundaries", () => {
    expect(
      checkRateLimitKey("credential-login:hash", { limit: 1, windowMs: 1_000 }, 1_000),
    ).toEqual({
      allowed: true,
    });
    expect(
      checkRateLimitKey("credential-login:hash", { limit: 1, windowMs: 1_000 }, 1_100),
    ).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
  });

  it("does not keep an expired entry when a new client arrives", () => {
    expect(checkRateLimitKey("old", { limit: 1, windowMs: 10 }, 1_000)).toEqual({ allowed: true });
    expect(checkRateLimitKey("new", { limit: 1, windowMs: 10 }, 2_000)).toEqual({ allowed: true });
    expect(checkRateLimitKey("old", { limit: 1, windowMs: 10 }, 2_000)).toEqual({ allowed: true });
  });
});
