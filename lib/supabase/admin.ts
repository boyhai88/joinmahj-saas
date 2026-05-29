import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client (service role).
 *
 * SERVER-ONLY. Uses SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level
 * Security — never import this from a Client Component. Intended for trusted
 * server contexts such as Stripe webhooks.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase service role configuration.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
