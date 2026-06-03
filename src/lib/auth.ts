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
    options: { redirectTo },
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

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
