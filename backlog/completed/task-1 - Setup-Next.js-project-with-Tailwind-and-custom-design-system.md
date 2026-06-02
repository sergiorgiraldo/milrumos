---
id: TASK-1
title: Setup Next.js project with Tailwind and custom design system
status: Done
assignee: []
created_date: '2026-06-02 06:20'
updated_date: '2026-06-02 09:50'
labels:
  - setup
  - frontend
milestone: m-0
dependencies: []
modified_files:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/lib/design-tokens.ts
  - src/__tests__/design-tokens.test.ts
  - jest.config.ts
  - package.json
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Initialize the Next.js (App Router) project with Tailwind CSS configured to use the project's custom color palette and Verdana font. This is the base all other work builds on.

Color tokens to register in tailwind.config (from CLAUDE.md): ruby-red, snow, pale-slate, air-force-blue, sky-blue — each with shades 50–950. Font: Verdana medium.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 next dev starts without errors
- [x] #2 tailwind.config registers all five custom color families (ruby-red, snow, pale-slate, air-force-blue, sky-blue) with shades 50–950
- [x] #3 Verdana is set as the default font family
- [x] #4 A smoke-test page renders using at least one custom color token
- [x] #5 Unit test verifies tailwind config exports expected color keys
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Initialized Next.js 16 (App Router) with Tailwind v4. Colors configured via CSS @theme in globals.css — all 5 families (ruby-red, snow, pale-slate, air-force-blue, sky-blue) with shades 50–950. Verdana set as default font. Smoke-test page uses ruby-red, air-force-blue, sky-blue, and pale-slate tokens. Design tokens exported from src/lib/design-tokens.ts; 11 Jest unit tests verify all families and shades. Build and tests pass clean.
<!-- SECTION:FINAL_SUMMARY:END -->
