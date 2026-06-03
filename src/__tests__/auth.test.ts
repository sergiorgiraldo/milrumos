import { upsertProfile, signInWithGoogle, signInWithGitHub, signOut } from '@/lib/auth';
import type { SupabaseClient, User } from '@supabase/supabase-js';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

function makeSupabase(upsertResult: { error: null | { message: string } } = { error: null }) {
  const upsert = jest.fn().mockResolvedValue(upsertResult);
  const from = jest.fn().mockReturnValue({ upsert });
  const signInWithOAuth = jest.fn().mockResolvedValue({ data: {}, error: null });
  const signOutFn = jest.fn().mockResolvedValue({ error: null });
  return {
    from,
    auth: { signInWithOAuth, signOut: signOutFn },
    _upsert: upsert,
    _signInWithOAuth: signInWithOAuth,
    _signOut: signOutFn,
  } as unknown as SupabaseClient & {
    _upsert: jest.Mock;
    _signInWithOAuth: jest.Mock;
    _signOut: jest.Mock;
  };
}

describe('upsertProfile', () => {
  it('calls upsert with correct fields for a full metadata user', async () => {
    const client = makeSupabase();
    const user = makeUser({
      id: 'abc',
      email: 'writer@example.com',
      user_metadata: {
        preferred_username: 'writer42',
        full_name: 'Ada Writer',
        avatar_url: 'https://example.com/avatar.png',
      },
    });

    const error = await upsertProfile(client, user);

    expect(error).toBeNull();
    expect(client.from).toHaveBeenCalledWith('profiles');
    const upsertArg = (client as ReturnType<typeof makeSupabase>)._upsert.mock.calls[0][0];
    expect(upsertArg.id).toBe('abc');
    expect(upsertArg.username).toBe('writer42');
    expect(upsertArg.display_name).toBe('Ada Writer');
    expect(upsertArg.avatar_url).toBe('https://example.com/avatar.png');
  });

  it('falls back to email prefix when no preferred_username', async () => {
    const client = makeSupabase();
    const user = makeUser({ id: 'xyz', email: 'someone@test.com', user_metadata: {} });

    await upsertProfile(client, user);

    const upsertArg = (client as ReturnType<typeof makeSupabase>)._upsert.mock.calls[0][0];
    expect(upsertArg.username).toBe('someone');
  });

  it('uses user_name from GitHub metadata', async () => {
    const client = makeSupabase();
    const user = makeUser({
      id: 'gh-1',
      email: 'gh@example.com',
      user_metadata: { user_name: 'githubuser', full_name: 'GH User' },
    });

    await upsertProfile(client, user);

    const upsertArg = (client as ReturnType<typeof makeSupabase>)._upsert.mock.calls[0][0];
    expect(upsertArg.username).toBe('githubuser');
  });

  it('returns error when upsert fails', async () => {
    const client = makeSupabase({ error: { message: 'db error' } });
    const user = makeUser();

    const error = await upsertProfile(client, user);

    expect(error).toEqual({ message: 'db error' });
  });
});

describe('signInWithGoogle', () => {
  it('calls signInWithOAuth with google provider', async () => {
    const client = makeSupabase();
    await signInWithGoogle(client);

    const call = (client as ReturnType<typeof makeSupabase>)._signInWithOAuth.mock.calls[0][0];
    expect(call.provider).toBe('google');
    expect(call.options.redirectTo).toContain('/auth/callback');
  });
});

describe('signInWithGitHub', () => {
  it('calls signInWithOAuth with github provider', async () => {
    const client = makeSupabase();
    await signInWithGitHub(client);

    const call = (client as ReturnType<typeof makeSupabase>)._signInWithOAuth.mock.calls[0][0];
    expect(call.provider).toBe('github');
    expect(call.options.redirectTo).toContain('/auth/callback');
  });
});

describe('signOut', () => {
  it('calls auth.signOut', async () => {
    const client = makeSupabase();
    await signOut(client);
    expect((client as ReturnType<typeof makeSupabase>)._signOut).toHaveBeenCalledTimes(1);
  });
});
