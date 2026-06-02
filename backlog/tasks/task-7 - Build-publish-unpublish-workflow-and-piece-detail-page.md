---
id: TASK-7
title: Build publish/unpublish workflow and piece detail page
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - frontend
  - backend
milestone: m-1
dependencies:
  - TASK-5
  - TASK-6
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Authors need a clear action to publish a draft or revert a published piece back to draft. Published pieces need a read-only public detail page that other authenticated users can view. The detail page must show all sections in order, authorship, publish date, and metadata tags.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Editor toolbar has a Publish button that transitions piece from draft to published
- [ ] #2 Published pieces show an Unpublish button to revert to draft
- [ ] #3 Attempting to view a draft piece by another user returns 404 or redirects
- [ ] #4 Public piece detail page renders all sections in order
- [ ] #5 Detail page shows: author name, publish date, genre/tag metadata
- [ ] #6 Unit tests cover publish, unpublish, and unauthorized-draft-view cases
<!-- AC:END -->
