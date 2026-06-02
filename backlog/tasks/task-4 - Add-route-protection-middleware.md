---
id: TASK-4
title: Add route protection middleware
status: To Do
assignee: []
created_date: '2026-06-02 06:20'
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
- [ ] #1 Visiting any protected route without a session redirects to /login
- [ ] #2 After login, user is redirected to the originally requested URL
- [ ] #3 Login page itself is accessible without a session
- [ ] #4 Middleware does not block static assets or API routes that are intentionally public
- [ ] #5 Unit test: middleware redirects unauthenticated request to /login
<!-- AC:END -->
