import "server-only";

type RateLimitPolicy = Readonly<{ limit: number; windowMs: number }>;
type RateLimitEntry = { count: number; resetAt: number };

export type RateLimitResult =
  Readonly<{ allowed: true }> | Readonly<{ allowed: false; retryAfterSeconds: number }>;

const entries = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;

function getClientKey(request: Request): string {
  const forwarded = request.headers?.get?.("x-forwarded-for")?.split(",", 1)[0]?.trim();
  const realIp = request.headers?.get?.("x-real-ip")?.trim();
  return forwarded || realIp || "unknown-client";
}

export function checkRateLimit(
  request: Request,
  scope: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): RateLimitResult {
  return checkRateLimitKey(`${scope}:${getClientKey(request)}`, policy, now);
}

export function checkRateLimitKey(
  key: string,
  policy: RateLimitPolicy,
  now = Date.now(),
): RateLimitResult {
  const current = entries.get(key);

  if (!current || current.resetAt <= now) {
    if (!current) makeRoom(now);
    entries.set(key, { count: 1, resetAt: now + policy.windowMs });
    return { allowed: true };
  }

  if (current.count >= policy.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}

function makeRoom(now: number): void {
  if (entries.size < MAX_ENTRIES) return;

  for (const [entryKey, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(entryKey);
  }

  if (entries.size < MAX_ENTRIES) return;
  const oldestKey = entries.keys().next().value as string | undefined;
  if (oldestKey) entries.delete(oldestKey);
}

export function resetRateLimitsForTests(): void {
  entries.clear();
}
