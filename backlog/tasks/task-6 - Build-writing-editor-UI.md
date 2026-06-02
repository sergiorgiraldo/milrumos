---
id: TASK-6
title: Build writing editor UI
status: To Do
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-02 06:57'
labels:
  - frontend
  - editor
milestone: m-1
dependencies:
  - TASK-1
  - TASK-5
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the page where an author writes and edits a piece. The editor is a markdown WYSIWYG editor — authors see formatted output while writing (not raw markdown syntax). Must support multi-section/chapter structure. Authors add, reorder, rename, and delete sections. Auto-save to draft on change. Uses the project color palette and Verdana font.

Choose a WYSIWYG markdown library compatible with Next.js (e.g. Milkdown, TipTap with markdown serialization, or ByteMD). The editor stores and loads raw markdown but renders it as formatted prose in real time.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Author can create a new piece from the dashboard
- [ ] #2 Editor renders markdown as formatted prose (bold, italic, headings, lists, blockquotes) while the author types — not raw syntax
- [ ] #3 Underlying storage format is markdown text (round-trips cleanly through parse→serialize)
- [ ] #4 Editor shows a list of sections; each section has a title and a WYSIWYG body
- [ ] #5 Author can add a new section, reorder sections, rename a section, and delete a section
- [ ] #6 Content auto-saves to draft state without a manual save button (debounced), triggering a version snapshot via TASK-5 API
- [ ] #7 Word count is displayed per section and for the whole piece
- [ ] #8 Editor is accessible via keyboard (tab-focusable controls)
- [ ] #9 Unit tests cover section add, reorder, delete, markdown round-trip, and auto-save trigger logic
<!-- AC:END -->
