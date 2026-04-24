import { createClient } from '@supabase/supabase-js'

/**
 * Service-role admin client — ONLY use inside /app/api/ route handlers.
 * NEVER import this in client components or 'use client' files.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
