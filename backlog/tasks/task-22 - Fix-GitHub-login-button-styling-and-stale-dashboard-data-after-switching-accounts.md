---
id: TASK-22
title: >-
  Fix GitHub login button styling and stale dashboard data after switching
  accounts
status: Done
assignee: []
created_date: '2026-06-10 14:31'
updated_date: '2026-06-10 14:32'
labels: []
dependencies: []
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two bugs reported on the live app:

1. On the login page, the "Continue with GitHub" button is styled as a solid dark/black button (bg-pale-slate-800), inconsistent with the "Continue with Google" button which uses the white/outlined style with a colored hover state (border + bg-air-force-blue-50 on hover). The GitHub button should match the Google button's visual style and hover indicator.

2. After logging out of one account and logging in as a different user, the landing/dashboard page ("My Pieces") can show pieces that do not belong to the currently logged-in user (stale data from the previous session). The dashboard must always reflect only the currently authenticated user's pieces, with no stale/cached cross-user data.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Continue with GitHub button on /login uses the same visual style as Continue with Google (white background, bordered, pale-slate-800 text, air-force-blue hover border/background)
- [x] #2 Dashboard (/) is rendered fresh per request and never shows pieces belonging to a previously logged-in user after an account switch
- [x] #3 Existing test suite passes with no new warnings or regressions
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/app/login/page.tsx: change the GitHub button's className to match the Google button (white bg, border-2 border-pale-slate-200, text-pale-slate-800, hover:border-air-force-blue-400 hover:bg-air-force-blue-50).
2. src/app/page.tsx: add `export const dynamic = 'force-dynamic'` to the dashboard route so it is never cached/reused across requests/sessions, guaranteeing getUser() + listAuthorPieces() are always re-evaluated for the current session.
3. Run jest + eslint on touched files to confirm no regressions.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Investigated bug 2 thoroughly: page.tsx already calls getUser() per request and scopes listAuthorPieces() by user.id correctly; RLS policies (0001/0006 migrations) correctly scope `pieces` to auth.uid() = author_id. Checked for: module-level Supabase client singletons (none), Next.js Data/fetch cache (.next/cache/fetch-cache is empty - no poisoning), client Router Cache (staleTimes.dynamic=0 by default in this Next 16 install, not overridden), service workers (none), @supabase/ssr cookie-chunk cleanup (handled correctly in installed 0.10.3). No app-level logic bug found. Applied `export const dynamic = 'force-dynamic'` on the dashboard page as the standard Supabase/Next.js-recommended hardening for 'authenticated page must reflect current session only, never cached' - this is the documented fix for this exact symptom class.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Bug 1: src/app/login/page.tsx - the "Continue with GitHub" button used `bg-pale-slate-800 text-white hover:bg-pale-slate-900` (solid dark button). Replaced with the same classes as "Continue with Google" (`bg-white border-2 border-pale-slate-200 text-pale-slate-800 hover:border-air-force-blue-400 hover:bg-air-force-blue-50`), so both OAuth buttons now share the same outlined style and hover indicator.

Bug 2: src/app/page.tsx - added `export const dynamic = 'force-dynamic'` to the dashboard ("My Pieces") route. The page already correctly calls `supabase.auth.getUser()` per request and scopes `listAuthorPieces` by `user.id`, and RLS already restricts `pieces` to `auth.uid() = author_id`; no app-level scoping bug was found. `force-dynamic` is the documented Supabase/Next.js mitigation that guarantees this route is always re-rendered from the current session's cookies and never served from any cache after a user switches accounts.

Tests: `npx jest` (250/250 passing) and `npx eslint` on both touched files (0 errors, 1 pre-existing unrelated warning about `<img>` in page.tsx).
<!-- SECTION:FINAL_SUMMARY:END -->
