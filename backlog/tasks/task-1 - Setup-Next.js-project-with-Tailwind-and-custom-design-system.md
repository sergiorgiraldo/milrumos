---
id: TASK-1
title: Setup Next.js project with Tailwind and custom design system
status: To Do
assignee: []
created_date: '2026-06-02 06:20'
labels:
  - setup
  - frontend
milestone: m-0
dependencies: []
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
- [ ] #1 next dev starts without errors
- [ ] #2 tailwind.config registers all five custom color families (ruby-red, snow, pale-slate, air-force-blue, sky-blue) with shades 50–950
- [ ] #3 Verdana is set as the default font family
- [ ] #4 A smoke-test page renders using at least one custom color token
- [ ] #5 Unit test verifies tailwind config exports expected color keys
<!-- AC:END -->
