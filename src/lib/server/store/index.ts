import "server-only";
import { fileStore } from "./file";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

export type { Store, Table } from "./types";

/** True when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set; otherwise data lives in data/db.json. */
export const usingSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const store: Store = usingSupabase ? supabaseStore : fileStore;

/** UTC instants bounding a Vietnam calendar day ("YYYY-MM-DD", UTC+7), for createdAt range queries. */
export function vnDayBounds(day: string): [string, string] {
  const start = Date.parse(`${day}T00:00:00+07:00`);
  return [new Date(start).toISOString(), new Date(start + 86_400_000).toISOString()];
}
