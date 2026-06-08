---
id: TASK-17
title: Add formatting toolbar to piece editor
status: To Do
assignee: []
created_date: '2026-06-08 13:42'
labels:
  - editor
  - frontend
dependencies: []
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Writers currently edit pieces as raw markdown with no visual aids. Add a toolbar to the editor (PieceEditor / SectionEditor) offering common formatting actions — bold, italic, headers, lists, etc. — that insert/wrap markdown syntax in the text. The underlying content stays markdown; the toolbar is a convenience layer over the existing markdown document, not a switch to rich-text/WYSIWYG.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Toolbar appears above or alongside the editor with buttons for at least: bold, italic, headers (e.g. H1/H2/H3), bullet list, numbered list, and link
- [ ] #2 Clicking a toolbar button wraps or inserts the corresponding markdown syntax around the current selection (or at the cursor if nothing is selected)
- [ ] #3 Toolbar buttons work correctly with both empty selections and existing selected text
- [ ] #4 The stored/saved content remains plain markdown, unchanged in format from the current editor output
- [ ] #5 Toolbar styling follows the project's Tailwind color palette and Verdana font per CLAUDE.md
- [ ] #6 Unit tests cover the markdown-insertion logic for each toolbar action
<!-- AC:END -->
