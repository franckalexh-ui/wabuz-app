import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * True when both NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set in the environment.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase client.
 *
 * When env vars are missing we still create a client (with placeholder
 * values) so that `supabase.from(…).update(…)` calls return a proper
 * `{ error }` object instead of throwing a TypeError.  Existing code
 * already handles Supabase errors gracefully — it falls back to
 * local-only mode.
 *
 * Prefer checking `isSupabaseConfigured` before making calls so the
 * request is skipped entirely (avoids unnecessary network latency).
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
);
