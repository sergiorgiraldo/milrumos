---
id: TASK-10
title: Build fork UI on piece detail page
status: Done
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-04 17:51'
labels:
  - frontend
  - branching
milestone: m-2
dependencies:
  - TASK-7
  - TASK-9
modified_files:
  - src/components/ForkPanel.tsx
  - 'src/app/pieces/[id]/page.tsx'
  - 'src/app/pieces/[id]/edit/page.tsx'
  - src/components/PieceEditor.tsx
  - src/lib/fork.ts
  - src/__tests__/fork.test.ts
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On the public piece detail page, each section heading gets a Fork from here button. Clicking it calls the fork API (TASK-9) and redirects the author to the new piece in the editor. The UI must make the fork point obvious — show which sections will be inherited and which will be the author's to write.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Each section on the detail page shows a Fork from here action (visible to logged-in non-owner)
- [x] #2 Hovering/focusing Fork from here highlights sections that will be copied (sections 1..N)
- [x] #3 Confirming fork calls the API and redirects to the new piece editor
- [x] #4 The new piece editor shows inherited sections as read-only and an empty writable section below
- [x] #5 Author cannot fork their own piece (button hidden or shows tooltip)
- [x] #6 Unit tests cover fork-button visibility, inherited-section lock, and redirect behavior
<!-- AC:END -->
