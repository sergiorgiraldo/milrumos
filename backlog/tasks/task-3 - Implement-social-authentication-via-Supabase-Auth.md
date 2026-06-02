---
id: TASK-3
title: Implement social authentication via Supabase Auth
status: To Do
assignee: []
created_date: '2026-06-02 06:20'
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
- [ ] #1 User can log in with Google
- [ ] #2 User can log in with GitHub
- [ ] #3 On first login a profiles row is created automatically
- [ ] #4 User session persists across page refreshes
- [ ] #5 Logout clears session and redirects to login page
- [ ] #6 Unit tests cover session creation and profile upsert logic
<!-- AC:END -->
