---
id: TASK-23
title: Fix explore page missing top bar and stale cross-user dashboard data
status: Done
assignee: []
created_date: '2026-06-10 16:56'
updated_date: '2026-06-10 18:21'
labels: []
dependencies: []
modified_files:
  - src/app/explore/page.tsx
  - middleware.ts
  - src/__tests__/middleware.test.ts
  - src/lib/supabase/server.ts
  - src/lib/supabase/client.ts
  - src/lib/auth.ts
  - src/__tests__/auth.test.ts
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two bugs reported live:

1. /explore renders `<NavBar />` with no `rightContent`, so the user avatar/name and Sign out button (present on `/`) are missing on the explore page.

2. After switching accounts, `/` ("My Pieces") can still show a previous user's pieces (regression on top of TASK-22, which added `force-dynamic` to `/` but did not fully fix it). Root cause beyond `force-dynamic`: the browser back/forward cache (bfcache) can restore a fully-rendered previous page (incl. another user's dashboard HTML) without any new request, since no `Cache-Control` header was set.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 /explore shows the same avatar/display-name/Sign out controls as /
- [x] #2 All app pages send Cache-Control: no-store so bfcache cannot resurrect a previous user's rendered page
- [x] #3 Existing test suite passes with no regressions
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bug 2 still reproduced after the no-store header fix (user: 'signed out, signed in, dashboard shows pieces from other user'). Found the actual gap: @supabase/ssr's auth.getUser() / REST calls go through the global fetch, which Next.js (and Turbopack's dev fetch cache) can cache by URL alone, ignoring the per-request Authorization cookie. Fixed by passing `global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) }` to createServerClient (server.ts + middleware.ts) and createBrowserClient (client.ts), so every Supabase auth/data call is always fetched fresh per request/session regardless of which user it belongs to.

Real root cause of bug 2 found: not server caching, but Google IdP SSO session stickiness. After app sign-out, browser still logged into Google, so 'Continue with Google' silently re-auths same account, no picker shown. Fixed by adding queryParams: { prompt: 'select_account' } to signInWithGoogle in src/lib/auth.ts, forcing account chooser every time. GitHub OAuth has no equivalent param - if user tests with GitHub in a browser still logged into github.com, switching accounts still requires logging out of github.com itself or using another browser/profile.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
1. src/app/explore/page.tsx: fetch the current user's profile (display_name/avatar_url/username) alongside the explore feed and pass it as NavBar's `rightContent` (avatar + name + LogoutButton), mirroring `/`.

2. middleware.ts: every matched response (including redirects) now gets `Cache-Control: no-store, must-revalidate` via a new `noStore()` helper. This is additive to TASK-22's `force-dynamic` fix and closes the bfcache gap: switching accounts and navigating back/forward can no longer resurrect another user's previously rendered "My Pieces" page from the browser's memory cache.

Tests: added 2 middleware tests for the no-store header. `npx jest` (252/252 passing), `npx tsc --noEmit` clean, eslint clean (1 pre-existing unrelated <img> warning, same as page.tsx).

Follow-up: src/lib/supabase/server.ts, src/lib/supabase/client.ts, middleware.ts now pass `global: { fetch }` with `cache: 'no-store'` to every Supabase client, so auth/session and pieces responses can never be served from a cross-user/cross-request fetch cache. `npx jest` (252/252) and `npx tsc --noEmit` clean after this change.

Added prompt: 'select_account' to Google OAuth sign-in (src/lib/auth.ts) plus matching test (src/__tests__/auth.test.ts). This forces Google's account chooser so a user who switches accounts in our app doesn't get silently re-authenticated as their previous Google account via the browser's existing Google session. The earlier no-store caching fixes remain as valid hardening but were not the actual cause of the reported cross-user dashboard symptom.
<!-- SECTION:FINAL_SUMMARY:END -->
