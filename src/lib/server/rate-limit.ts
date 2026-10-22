import { headers } from "next/headers";
import { store } from "./store";

/**
 * Fixed-window rate limits. Counted in the store, so on Supabase every server instance shares
 * the same count (a serverless host runs many); the file store counts in memory.
 */

/** The caller's IP as seen through a proxy (x-forwarded-for), or "local". */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** True if this key may act now; counts the attempt. `limit` attempts per `windowMs`. */
export function allow(key: string, limit: number, windowMs: number): Promise<boolean> {
  return store.hit(key, limit, windowMs);
}

/** Forget a key, e.g. after a successful sign-in. */
export function reset(key: string): Promise<void> {
  return store.clearHits(key);
}
