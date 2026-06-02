---
id: TASK-10
title: Build fork UI on piece detail page
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - frontend
  - branching
milestone: m-2
dependencies:
  - TASK-7
  - TASK-9
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On the public piece detail page, each section heading gets a Fork from here button. Clicking it calls the fork API (TASK-9) and redirects the author to the new piece in the editor. The UI must make the fork point obvious — show which sections will be inherited and which will be the author's to write.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each section on the detail page shows a Fork from here action (visible to logged-in non-owner)
- [ ] #2 Hovering/focusing Fork from here highlights sections that will be copied (sections 1..N)
- [ ] #3 Confirming fork calls the API and redirects to the new piece editor
- [ ] #4 The new piece editor shows inherited sections as read-only and an empty writable section below
- [ ] #5 Author cannot fork their own piece (button hidden or shows tooltip)
- [ ] #6 Unit tests cover fork-button visibility, inherited-section lock, and redirect behavior
<!-- AC:END -->
