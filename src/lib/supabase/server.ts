import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";

/**
 * Server-side Supabase client for use in Server Components, Route Handlers and
 * Server Actions. Reads the auth cookie so RLS sees the logged-in user.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Setting cookies in a Server Component will fail (read-only).
            // This is expected when called from a page, not an action/route.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS entirely. Use only in secure server
 * contexts (API routes, server actions) where you need full access (e.g.
 * creating orders for guest users, running migrations).
 */
export function createServiceClient() {
  // Dynamic require so the service role key is never bundled client-side.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js") as {
    createClient: typeof import("@supabase/supabase-js").createClient;
  };
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
