---
id: TASK-9
title: Implement fork-from-section API
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - backend
  - api
  - branching
milestone: m-2
dependencies:
  - TASK-5
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The core differential feature: any authenticated user can fork a published piece starting from any section. Forking creates a new piece owned by the forker. It copies sections up to (and including) the chosen fork point. The piece_lineage table records parent_piece_id and fork_section_id so the relationship is traceable.

Schema dependency: piece_lineage table from TASK-2.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 POST /fork endpoint (or server action) accepts piece_id and section_id
- [ ] #2 New piece is created owned by the requesting user, status=draft
- [ ] #3 Sections up to and including fork_section_id are copied to the new piece in order
- [ ] #4 A piece_lineage row is inserted: parent_piece_id, fork_section_id, child_piece_id
- [ ] #5 Cannot fork a draft piece owned by another user (returns 403)
- [ ] #6 Cannot fork your own piece (returns 400)
- [ ] #7 Unit tests cover successful fork, draft-piece guard, and self-fork guard
<!-- AC:END -->
