---
id: TASK-15
title: Build branch tree visualization
status: Done
assignee: []
created_date: '2026-06-02 06:22'
updated_date: '2026-06-08 14:32'
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
- [x] #1 Piece detail page has a View branch tree link/button
- [x] #2 Tree view shows the root piece and all direct and transitive forks as nodes
- [x] #3 Edges are labeled with the fork-point section name
- [x] #4 Clicking a node navigates to that piece's detail page
- [x] #5 Current piece node is visually highlighted
- [x] #6 Tree handles at least 3 levels of nesting without layout overflow
- [x] #7 Orphaned or deleted parent pieces show a placeholder node
- [x] #8 Unit tests cover tree data assembly from piece_lineage rows
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Branch tree visualization already built and merged in commit 55f97de. Verified: "View branch tree" link on piece detail page (src/app/pieces/[id]/page.tsx:140-143), tree page at /pieces/[id]/tree assembling root + all forks via getBranchTree/assembleBranchTree (src/lib/branchTree.ts), edges labeled with fork-section title, current node highlighted in ruby-red, deleted/orphaned parents render dashed placeholder nodes, nested ul/li layout scrolls horizontally for deep trees, and unit tests in src/__tests__/branchTree.test.ts (part of 21 passing) cover tree assembly from piece_lineage rows including placeholders.
<!-- SECTION:FINAL_SUMMARY:END -->
