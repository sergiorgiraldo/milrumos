import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Keep auth/session responses from being reused across accounts
        // when switching users in the same browser session.
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  );
}
