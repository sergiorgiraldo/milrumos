---
id: TASK-11
title: Show lineage/origin on piece detail page
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
labels:
  - frontend
  - branching
milestone: m-2
dependencies:
  - TASK-10
priority: medium
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When a piece was forked from another piece, the detail page must clearly show its origin: which parent piece it branched from, at which section, and who wrote the original. This builds trust and attribution for the collaborative writing ecosystem.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Forked pieces display a Forked from banner linking to the parent piece
- [ ] #2 Banner shows: parent piece title, author name, and the section name used as fork point
- [ ] #3 Original pieces (no parent) show no lineage banner
- [ ] #4 Clicking the banner link navigates to the parent piece detail page
- [ ] #5 Unit tests cover lineage-present and lineage-absent rendering
<!-- AC:END -->
