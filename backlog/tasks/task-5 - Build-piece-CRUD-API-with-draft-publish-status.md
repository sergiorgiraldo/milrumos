---
id: TASK-5
title: Build piece CRUD API with draft/publish status
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - backend
  - api
milestone: m-1
dependencies:
  - TASK-2
  - TASK-4
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement server-side API (Next.js Server Actions or Route Handlers) for creating, reading, updating, and deleting pieces and their sections. A piece has a status field: draft or published. Only the author can change status or edit content. Published pieces are readable by all authenticated users.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Author can create a piece with title and initial sections
- [ ] #2 Author can update any field of their own piece
- [ ] #3 Author can delete their own piece (cascades to sections and lineage rows)
- [ ] #4 Author can toggle status between draft and published
- [ ] #5 Other authenticated users cannot mutate a piece they do not own (returns 403)
- [ ] #6 Unit tests cover create, update, delete, publish, and permission-denial cases
<!-- AC:END -->
