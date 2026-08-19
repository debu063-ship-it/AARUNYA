import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

/**
 * Server-side Supabase client with the SERVICE ROLE key.
 * Used for admin operations: verifying tokens, managing users, storage uploads.
 * NEVER expose this on the client side.
 */
export const supabaseAdmin = createClient(
  ENV.supabaseUrl || "https://placeholder-project.supabase.co",
  ENV.supabaseServiceRoleKey || "placeholder-service-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
