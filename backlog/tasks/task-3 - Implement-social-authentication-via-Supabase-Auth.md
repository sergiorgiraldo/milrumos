---
id: TASK-3
title: Implement social authentication via Supabase Auth
status: Done
assignee: []
created_date: '2026-06-02 06:20'
updated_date: '2026-06-03 07:03'
labels:
  - auth
  - backend
  - frontend
milestone: m-0
dependencies:
  - TASK-1
  - TASK-2
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Wire up social login (Google and GitHub) using Supabase Auth OAuth providers. On first login, create a profile row in the profiles table (from TASK-2 schema). No page should be accessible without a valid session.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 User can log in with Google
- [x] #2 User can log in with GitHub
- [x] #3 On first login a profiles row is created automatically
- [x] #4 User session persists across page refreshes
- [x] #5 Logout clears session and redirects to login page
- [x] #6 Unit tests cover session creation and profile upsert logic
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented Supabase Auth social login (Google + GitHub). Added middleware route guard redirecting unauthenticated users to /login. OAuth callback handler at /auth/callback exchanges code for session and upserts profile. Profile upsert uses preferred_username/user_name/email-prefix fallback chain. Logout clears session and redirects. 7 unit tests all pass (53 total).
<!-- SECTION:FINAL_SUMMARY:END -->
