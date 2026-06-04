---
id: TASK-7
title: Build publish/unpublish workflow and piece detail page
status: Done
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-04 10:12'
labels:
  - frontend
  - backend
milestone: m-1
dependencies:
  - TASK-5
  - TASK-6
modified_files:
  - src/lib/pieces.ts
  - 'src/app/pieces/[id]/page.tsx'
  - src/__tests__/pieces.test.ts
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Authors need a clear action to publish a draft or revert a published piece back to draft. Published pieces need a read-only public detail page that other authenticated users can view. The detail page must show all sections in order, authorship, publish date, and metadata tags.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Editor toolbar has a Publish button that transitions piece from draft to published
- [x] #2 Published pieces show an Unpublish button to revert to draft
- [x] #3 Attempting to view a draft piece by another user returns 404 or redirects
- [x] #4 Public piece detail page renders all sections in order
- [x] #5 Detail page shows: author name, publish date, genre/tag metadata
- [x] #6 Unit tests cover publish, unpublish, and unauthorized-draft-view cases
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Publish/unpublish toggle in editor toolbar via PATCH /api/pieces/[id]/status. Public detail page at /pieces/[id] shows sections, author, publish date, genre/tags. Draft pieces by non-owners return notFound() (404). getPublicPiece() added to lib/pieces.ts with unit tests covering publish, unpublish, and unauthorized-draft-view.
<!-- SECTION:FINAL_SUMMARY:END -->
