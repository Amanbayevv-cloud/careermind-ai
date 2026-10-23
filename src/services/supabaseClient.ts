import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Public client: auth sessions managed by Supabase, never embed privileged keys here. */
export const supabase = url && key ? createClient(url, key, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
}) : null;

export function requireSupabase() {
  if (!supabase) throw new Error('VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY sozlanmagan');
  return supabase;
}
