---
id: TASK-16
title: Build piece version history and restore UI
status: To Do
assignee: []
created_date: '2026-06-02 06:58'
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
- [ ] #1 Editor has a Version History button that opens a side panel or modal
- [ ] #2 Panel lists all versions: version number, save timestamp, word count
- [ ] #3 Clicking a version shows a read-only preview of that version's markdown content
- [ ] #4 Author can click Restore this version to make it the current piece content
- [ ] #5 Restoring writes the snapshot back to sections and inserts a new piece_versions row (so the restore is undoable)
- [ ] #6 Confirmation prompt shown before restore to prevent accidental overwrites
- [ ] #7 Version list is paginated or scrollable for pieces with many saves
- [ ] #8 Unit tests cover: version list fetch, preview render, restore write, and post-restore version entry creation
<!-- AC:END -->
