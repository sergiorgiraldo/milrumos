import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServerClient } = require('@supabase/ssr') as {
  createServerClient: jest.Mock;
};

function makeRequest(pathname: string) {
  return new NextRequest(new URL(pathname, 'http://localhost:3000'));
}

function mockAuth(user: object | null) {
  createServerClient.mockReturnValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
  });
}

describe('middleware', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  it('redirects unauthenticated request to /login', async () => {
    mockAuth(null);
    const res = await middleware(makeRequest('/dashboard'));
    expect(res.headers.get('location')).toContain('/login');
  });

  it('includes returnTo in redirect', async () => {
    mockAuth(null);
    const res = await middleware(makeRequest('/dashboard'));
    expect(res.headers.get('location')).toContain('returnTo=%2Fdashboard');
  });

  it('allows unauthenticated access to /login', async () => {
    mockAuth(null);
    const res = await middleware(makeRequest('/login'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated access to /auth/callback', async () => {
    mockAuth(null);
    const res = await middleware(makeRequest('/auth/callback'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects authenticated user on /login to /', async () => {
    mockAuth({ id: 'user-1' });
    const res = await middleware(makeRequest('/login'));
    const location = res.headers.get('location') ?? '';
    expect(location).toMatch(/\/$/);
    expect(location).not.toContain('/login');
  });

  it('allows authenticated user to access protected routes', async () => {
    mockAuth({ id: 'user-1' });
    const res = await middleware(makeRequest('/dashboard'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('disables caching on protected pages so a logged-out/switched user never sees a stale page via bfcache', async () => {
    mockAuth({ id: 'user-1' });
    const res = await middleware(makeRequest('/dashboard'));
    expect(res.headers.get('Cache-Control')).toBe('no-store, must-revalidate');
  });

  it('disables caching on the login redirect', async () => {
    mockAuth(null);
    const res = await middleware(makeRequest('/dashboard'));
    expect(res.headers.get('Cache-Control')).toBe('no-store, must-revalidate');
  });
});
