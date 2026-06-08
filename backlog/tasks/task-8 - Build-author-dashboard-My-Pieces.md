---
id: TASK-8
title: Build author dashboard (My Pieces)
status: Done
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-04 13:19'
labels:
  - frontend
milestone: m-1
dependencies:
  - TASK-5
  - TASK-7
priority: medium
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
An authenticated author's home page listing all their pieces with status (draft/published), last-modified date, word count, and quick actions (edit, publish/unpublish, delete). This is the main navigation hub for writers.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Dashboard lists all pieces owned by the logged-in author
- [ ] #2 Each row shows: title, status badge (draft/published), last modified date, section count, word count
- [ ] #3 Quick-action buttons: Edit, Publish/Unpublish, Delete (with confirmation)
- [ ] #4 Empty state shown when author has no pieces yet, with a Create First Piece CTA
- [ ] #5 New Piece button navigates to the editor with a blank piece
- [ ] #6 Unit tests cover list rendering, empty state, and delete confirmation logic
<!-- AC:END -->
