---
id: TASK-24
title: 'bug: pieces page does not haver top bar'
status: Done
assignee: []
created_date: '2026-06-10 18:37'
updated_date: '2026-06-10 19:19'
labels: []
dependencies: []
modified_files:
  - src/components/UserMenu.tsx
  - src/app/page.tsx
  - src/app/explore/page.tsx
  - src/app/search/page.tsx
  - 'src/app/pieces/[id]/page.tsx'
  - 'src/app/pieces/[id]/tree/page.tsx'
  - 'src/app/pieces/[id]/edit/page.tsx'
  - src/components/PieceEditor.tsx
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Make sure all pages show the top bar with user and sign out option
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary
Every logged-in page now shows user avatar/name + sign-out, not just dashboard/explore.

- Extracted shared `UserMenu` (avatar + display name + `LogoutButton`) to dedupe the block previously copy-pasted on dashboard and explore.
- Added `UserMenu` to the top bar on: piece detail (`/pieces/[id]`), branch tree (`/pieces/[id]/tree`), and search (`/search`) — fetching the viewer's profile alongside existing queries.
- Piece editor (`/pieces/[id]/edit`) had a fully custom toolbar with no NavBar at all. Added the viewer's profile to its server page and rendered `UserMenu` in the existing sticky toolbar (separated by a divider) so it has user info + sign out too.

## Tests
- `npx tsc --noEmit` clean
- `npm run lint` — no new errors (2 pre-existing `<a>`-to-`/` errors in NavBar/PieceEditor untouched)
- `npm test` — 253/253 passing
<!-- SECTION:FINAL_SUMMARY:END -->
