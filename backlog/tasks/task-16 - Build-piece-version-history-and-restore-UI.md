---
id: TASK-16
title: Build piece version history and restore UI
status: Done
assignee: []
created_date: '2026-06-02 06:58'
updated_date: '2026-06-08 14:32'
labels:
  - frontend
  - backend
  - versioning
milestone: m-1
dependencies:
  - TASK-5
  - TASK-6
priority: medium
ordinal: 3500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Authors need to browse all saved versions of a piece and restore any previous version as the current one — like Microsoft Word's version history. Each version is a timestamped snapshot of the full piece markdown (stored in piece_versions by TASK-5). Restoring a version overwrites the current sections with the snapshot content and creates a new version entry (so the restore itself is recorded).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Editor has a Version History button that opens a side panel or modal
- [x] #2 Panel lists all versions: version number, save timestamp, word count
- [x] #3 Clicking a version shows a read-only preview of that version's markdown content
- [x] #4 Author can click Restore this version to make it the current piece content
- [x] #5 Restoring writes the snapshot back to sections and inserts a new piece_versions row (so the restore is undoable)
- [x] #6 Confirmation prompt shown before restore to prevent accidental overwrites
- [x] #7 Version list is paginated or scrollable for pieces with many saves
- [x] #8 Unit tests cover: version list fetch, preview render, restore write, and post-restore version entry creation
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Version history & restore UI already built and merged in commit 55f97de. Verified: "History" button in PieceEditor (src/components/PieceEditor.tsx:276) opens VersionHistoryPanel side panel listing version number/timestamp/word count, click expands a read-only markdown preview, "Restore this version" with a confirmation step before calling POST /api/pieces/[id]/versions/[versionId]/restore, restoreVersion (src/lib/versions.ts) parses the snapshot and calls savePiece which writes sections and inserts a new piece_versions row, panel list is scrollable (overflow-y-auto), and unit tests in src/__tests__/versions.test.ts (part of 21 passing) cover listing, snapshot parsing, and restore write/new-version-entry behavior.
<!-- SECTION:FINAL_SUMMARY:END -->
