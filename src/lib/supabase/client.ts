import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

/**
 * Browser (client component) Supabase client. Uses the anon key — RLS policies
 * control what this client can see and do.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
