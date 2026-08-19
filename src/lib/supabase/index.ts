/**
 * Supabase module barrel export.
 * Import from "@/lib/supabase" for any database-related utilities.
 */
export { createClient } from "./client";
export { createServerSupabase, createServiceClient } from "./server";
export { isSupabaseConfigured } from "./queries";
export type { Database } from "./types";
