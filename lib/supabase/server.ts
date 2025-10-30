import { createServerClient, type CookieOptions, type SupabaseClient } from '@supabase/ssr';

export function getServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Create a server client with a no-op cookie adapter to satisfy SSR requirements.
  // This disables session persistence in RSC and avoids runtime cookie API differences.
  return createServerClient(url, anonKey, {
    cookies: {
      get(_name: string): string | undefined {
        return undefined;
      },
      set(_name: string, _value: string, _options: CookieOptions): void {
        // noop
      },
      remove(_name: string, _options: CookieOptions): void {
        // noop
      },
    },
  });
}


