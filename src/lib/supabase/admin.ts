import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Supabase Admin Client — uses the SERVICE ROLE key.
 *
 * ⚠️  SECURITY WARNING:
 * - NEVER expose this client to the browser.
 * - Only use in Server Components, Server Actions, or API Route Handlers.
 * - The service role key bypasses Row Level Security (RLS).
 * - Only use for trusted admin operations (e.g., webhook processing, cron jobs).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[supabase/admin] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh — admin client does not use user sessions
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
