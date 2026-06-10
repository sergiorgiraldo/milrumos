import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function upsertProfile(supabase: SupabaseClient, user: User) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username:
        user.user_metadata?.preferred_username ??
        user.user_metadata?.user_name ??
        user.email?.split('@')[0] ??
        user.id,
      display_name:
        user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );
  return error;
}

export async function signInWithGoogle(supabase: SupabaseClient, returnTo?: string) {
  const base = `${getBaseUrl()}/auth/callback`;
  const redirectTo = returnTo ? `${base}?next=${encodeURIComponent(returnTo)}` : base;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    // Without this, a browser that's still signed into Google silently
    // re-authenticates as that same account after our app's sign-out,
    // making "switch account" look like a stale-session bug. Forcing the
    // chooser lets the user actually pick a different Google account.
    options: { redirectTo, queryParams: { prompt: 'select_account' } },
  });
}

export async function signInWithGitHub(supabase: SupabaseClient, returnTo?: string) {
  const base = `${getBaseUrl()}/auth/callback`;
  const redirectTo = returnTo ? `${base}?next=${encodeURIComponent(returnTo)}` : base;
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo },
  });
}

export async function signOut(supabase: SupabaseClient) {
  return supabase.auth.signOut();
}

/**
 * Restricts post-login redirect targets to same-site relative paths.
 * Rejects absolute URLs, protocol-relative "//evil.com" paths, and
 * "@evil.com" userinfo tricks that would otherwise turn `${origin}${next}`
 * into a link to another host.
 */
export function sanitizeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
