/**
 * Supabase client setup with graceful development fallback.
 * If NEXT_PUBLIC_SUPABASE_URL is not configured, the app runs cleanly
 * in standalone local-storage mode without crashing or throwing errors.
 */

export interface SupabaseConfig {
  isConfigured: boolean;
  url: string | null;
  anonKey: string | null;
}

export const supabaseConfig: SupabaseConfig = {
  isConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
};

