---
id: TASK-15
title: Build branch tree visualization
status: To Do
assignee: []
created_date: '2026-06-02 06:22'
labels:
  - frontend
  - visualization
milestone: m-4
dependencies:
  - TASK-11
  - TASK-9
priority: medium
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
An interactive visual showing how a piece and all its forks (and forks-of-forks) relate. Accessible from any piece detail page. Each node is a piece; edges show fork relationships labeled with the section used as fork point. Helps readers and authors navigate the collaborative lineage of a story.

Use a lightweight graph/tree library (e.g. d3, react-flow, or similar) consistent with the project's no-fancy-stuff UI directive — clean, readable, not decorative.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Piece detail page has a View branch tree link/button
- [ ] #2 Tree view shows the root piece and all direct and transitive forks as nodes
- [ ] #3 Edges are labeled with the fork-point section name
- [ ] #4 Clicking a node navigates to that piece's detail page
- [ ] #5 Current piece node is visually highlighted
- [ ] #6 Tree handles at least 3 levels of nesting without layout overflow
- [ ] #7 Orphaned or deleted parent pieces show a placeholder node
- [ ] #8 Unit tests cover tree data assembly from piece_lineage rows
<!-- AC:END -->
