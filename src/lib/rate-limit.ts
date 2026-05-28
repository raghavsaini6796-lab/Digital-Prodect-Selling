/**
 * Simple In-Memory Rate Limiter for Next.js App Router
 * Note: In a true multi-region serverless deployment, use Redis (e.g. Upstash)
 * This serves as a basic protection layer adapted from the Express rate-limit logic.
 */

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60 * 1000): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, limit, remaining: limit - 1 };
  }

  // If the time window has passed, reset the count
  if (now - windowData.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { success: true, limit, remaining: limit - 1 };
  }

  // If within the time window, increment the count
  if (windowData.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  windowData.count += 1;
  rateLimitMap.set(ip, windowData);
  
  return { success: true, limit, remaining: limit - windowData.count };
}
