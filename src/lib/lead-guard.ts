/** Origin allow-list and in-memory rate limiter shared by lightweight public POST routes (same rules as /api/lead). */

export function isPermittedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === "www.puna-tech.com" || host === "puna-tech.com" || host === "localhost" || host === "127.0.0.1") return true;
    return host.endsWith(".vercel.app") && (host === "punav2.vercel.app" || host.startsWith("punav2-"));
  } catch {
    return false;
  }
}

/**
 * Best-effort limiter: the counters live in the memory of one serverless instance, so it slows a single noisy
 * client but is not a global guarantee. The honeypot, the minimum fill time and the blocklist do the rest.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetAt: number }>();
  return function limited(request: Request, now = Date.now()): boolean {
    const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (attempts.size > 5000) for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
    const current = attempts.get(key);
    if (!current || current.resetAt < now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    current.count += 1;
    return current.count > limit;
  };
}

export const PRODUCTION_LEAD_HOST = "www.puna-tech.com";

/**
 * True only for a real production request: the deployment is Vercel's Production environment AND the request
 * is addressed to www.puna-tech.com (and, when the browser sent an Origin, that Origin is the same host).
 * Previews, local dev, *.vercel.app production aliases and spoofed Origin headers all return false, so they
 * can never write to the production database or send mail.
 */
export function isProductionLeadRequest(request: Request, env: { VERCEL_ENV?: string } = process.env): boolean {
  if (env.VERCEL_ENV !== "production") return false;
  try {
    const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = (forwarded || new URL(request.url).host).toLowerCase();
    if (host !== PRODUCTION_LEAD_HOST) return false;
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host.toLowerCase() !== PRODUCTION_LEAD_HOST) return false;
    return true;
  } catch {
    return false;
  }
}
