---
id: TASK-17
title: Add formatting toolbar to piece editor
status: Done
assignee: []
created_date: '2026-06-08 13:42'
updated_date: '2026-06-08 14:53'
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
- [x] #1 Toolbar appears above or alongside the editor with buttons for at least: bold, italic, headers (e.g. H1/H2/H3), bullet list, numbered list, and link
- [x] #2 Clicking a toolbar button wraps or inserts the corresponding markdown syntax around the current selection (or at the cursor if nothing is selected)
- [x] #3 Toolbar buttons work correctly with both empty selections and existing selected text
- [x] #4 The stored/saved content remains plain markdown, unchanged in format from the current editor output
- [x] #5 Toolbar styling follows the project's Tailwind color palette and Verdana font per CLAUDE.md
- [x] #6 Unit tests cover the markdown-insertion logic for each toolbar action
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added a formatting toolbar to the section editor (TipTap-based, markdown-backed):
- src/lib/editorToolbar.ts: pure command functions (applyBold, applyItalic, applyHeading, applyBulletList, applyOrderedList, applyLink) that drive the existing TipTap editor's chained commands — the same mechanism StarterKit/tiptap-markdown already use to keep stored content as plain markdown, so saved output is unchanged (#4).
- src/components/EditorToolbar.tsx: 'use client' toolbar with Bold/Italic/H1/H2/H3/Bullet list/Numbered list/Link buttons (#1), using useEditorState for live active-state highlighting (aria-pressed) styled with the project's ruby-red/pale-slate palette (inherits global Verdana font) (#5). Each button calls editor.chain().focus()...run(), which TipTap applies to the current selection or at the cursor when nothing is selected (#2, #3). Link prompts for a URL and removes the mark when left empty.
- src/components/SectionEditor.tsx: mounts EditorToolbar above each section's EditorContent.
- src/__tests__/editorToolbar.test.ts: 11 unit tests covering the markdown-insertion command sequence for every toolbar action (bold, italic, each heading level, bullet/numbered lists, set/unset link, whitespace-only URL) using a chain-recording mock editor (#6).
- Added @tiptap/core as an explicit dependency (already present transitively) since EditorToolbar imports its Editor type.

Note: could not exercise this in a live browser — the app requires social login (Google/GitHub OAuth per CLAUDE.md) with no local Supabase instance or seed test account available in this environment, and .env is sandboxed from reads. Verified via `npx tsc --noEmit` (clean) and the full test suite (210/210 passing).
<!-- SECTION:FINAL_SUMMARY:END -->
