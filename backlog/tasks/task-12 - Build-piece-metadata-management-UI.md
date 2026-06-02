---
id: TASK-12
title: Build piece metadata management UI
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - frontend
  - metadata
milestone: m-3
dependencies:
  - TASK-6
priority: medium
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Authors need to tag their pieces with structured metadata: genre (single-select from a defined list), free-form tags/keywords, and a short description/idea summary. Metadata is editable from the writing editor and visible on the piece detail page. This data feeds the search feature in TASK-13.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Editor sidebar or panel exposes: genre selector, tag input (comma-separated or pill input), idea/summary textarea
- [ ] #2 Genre list includes at least: Fiction, Non-fiction, Poetry, Essay, Fantasy, Sci-Fi, Horror, Romance, Other
- [ ] #3 Tags are stored as an array in piece_metadata table
- [ ] #4 Metadata saves alongside auto-save (no separate save action needed)
- [ ] #5 Metadata is rendered on the piece detail page below the title
- [ ] #6 Unit tests cover metadata save, genre validation, and tag parsing
<!-- AC:END -->
