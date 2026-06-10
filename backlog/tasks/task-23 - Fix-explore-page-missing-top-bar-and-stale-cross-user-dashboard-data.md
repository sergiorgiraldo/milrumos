---
id: TASK-23
title: Fix explore page missing top bar and stale cross-user dashboard data
status: Done
assignee: []
created_date: '2026-06-10 16:56'
updated_date: '2026-06-10 16:57'
labels: []
dependencies: []
modified_files:
  - src/app/explore/page.tsx
  - middleware.ts
  - src/__tests__/middleware.test.ts
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



## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
1. src/app/explore/page.tsx: fetch the current user's profile (display_name/avatar_url/username) alongside the explore feed and pass it as NavBar's `rightContent` (avatar + name + LogoutButton), mirroring `/`.

2. middleware.ts: every matched response (including redirects) now gets `Cache-Control: no-store, must-revalidate` via a new `noStore()` helper. This is additive to TASK-22's `force-dynamic` fix and closes the bfcache gap: switching accounts and navigating back/forward can no longer resurrect another user's previously rendered "My Pieces" page from the browser's memory cache.

Tests: added 2 middleware tests for the no-store header. `npx jest` (252/252 passing), `npx tsc --noEmit` clean, eslint clean (1 pre-existing unrelated <img> warning, same as page.tsx).
<!-- SECTION:FINAL_SUMMARY:END -->
