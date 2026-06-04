// ── Rate limiter using Upstash Redis REST API ─────────────────────────────────
// No SDK dependency — uses plain fetch.
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//
// Algorithm: fixed window counter via Redis INCR + EXPIRE.
//   - On first request in a window: INCR creates key with count=1, then EXPIRE
//     sets the TTL. Subsequent calls just INCR.
//   - When the window expires Redis auto-deletes the key; next call resets to 1.
//
// If env vars are absent the limiter logs a warning and allows all requests
// (fail-open) so a missing env var never silently breaks checkout.

/**
 * Check and increment the rate limit for a key.
 *
 * @param {string} key    - e.g. "create-order:1.2.3.4"
 * @param {object} opts
 * @param {number} opts.max    - max requests allowed per window (default 10)
 * @param {number} opts.window - window size in seconds (default 60)
 * @returns {Promise<{ allowed: boolean, remaining: number, count: number }>}
 */
export async function rateLimit(key, { max = 10, window = 60 } = {}) {
  const base  = (process.env.UPSTASH_REDIS_REST_URL  || "").replace(/\/$/, "");
  const token =  process.env.UPSTASH_REDIS_REST_TOKEN || "";

  if (!base || !token) {
    console.warn("[rateLimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not configured — rate limiting disabled");
    return { allowed: true, remaining: max, count: 0 };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // INCR is atomic in Redis — safe under concurrent requests
  const incrRes = await fetch(`${base}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers,
  });
  const { result: count } = await incrRes.json();

  // Set TTL only on the very first increment so the window doesn't reset on
  // every request (EXPIRE is idempotent but we skip the extra round-trip).
  if (count === 1) {
    await fetch(`${base}/expire/${encodeURIComponent(key)}/${window}`, {
      method: "POST",
      headers,
    });
  }

  const allowed   = count <= max;
  const remaining = Math.max(0, max - count);
  return { allowed, remaining, count };
}

/**
 * Extract the real client IP from a Vercel / Node.js request.
 * Vercel sets x-forwarded-for at the edge; fall back to socket address.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}
