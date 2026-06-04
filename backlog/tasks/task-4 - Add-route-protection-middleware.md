---
id: TASK-4
title: Add route protection middleware
status: Done
assignee: []
created_date: '2026-06-02 06:20'
updated_date: '2026-06-03 16:52'
labels:
  - auth
  - frontend
milestone: m-0
dependencies:
  - TASK-3
priority: high
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure every page in the app (except the login/landing page) requires an authenticated session. Unauthenticated visitors must be redirected to the login page. Use Next.js middleware so protection is enforced at the edge, not per-page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Visiting any protected route without a session redirects to /login
- [x] #2 After login, user is redirected to the originally requested URL
- [x] #3 Login page itself is accessible without a session
- [x] #4 Middleware does not block static assets or API routes that are intentionally public
- [x] #5 Unit test: middleware redirects unauthenticated request to /login
<!-- AC:END -->
