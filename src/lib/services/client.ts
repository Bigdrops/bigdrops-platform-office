import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy supabase accessor — avoids throwing at module load when env vars are missing.
 * All service functions should use this instead of a static import.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  try {
    const { supabase } = await import("@/lib/supabase");
    return supabase;
  } catch {
    return null;
  }
}
