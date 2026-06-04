---
id: TASK-5
title: Build piece CRUD API with draft/publish status
status: Done
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-03 16:59'
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
Implement server-side API (Next.js Server Actions or Route Handlers) for creating, reading, updating, and deleting pieces and their sections. Section content is stored as markdown text. Every save (manual or auto-save) snapshots the full piece into piece_versions. A piece has a status field: draft or published. Only the author can change status or edit content. Published pieces are readable by all authenticated users.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Author can create a piece with title and initial sections
- [x] #2 Section content is stored and retrieved as raw markdown text
- [x] #3 Every save call inserts a new row in piece_versions with a full markdown snapshot and incremented version_number
- [x] #4 Author can update any field of their own piece
- [x] #5 Author can delete their own piece (cascades to sections, versions, and lineage rows)
- [x] #6 Author can toggle status between draft and published
- [x] #7 Other authenticated users cannot mutate a piece they do not own (returns 403)
- [x] #8 Unit tests cover create, update, delete, publish, versioned-save, and permission-denial cases
<!-- AC:END -->
