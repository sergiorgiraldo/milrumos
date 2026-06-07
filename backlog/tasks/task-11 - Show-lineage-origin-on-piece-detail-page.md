---
id: TASK-11
title: Show lineage/origin on piece detail page
status: In Progress
assignee:
  - Sergio Giraldo
created_date: '2026-06-02 06:21'
updated_date: '2026-06-04 20:55'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Files to create/modify
1. `src/lib/lineage.ts` — `getLineage(supabase, pieceId)` fetches piece_lineage, parent piece title+author, fork section title. Returns typed object or null.
2. `src/components/LineageBanner.tsx` — presentational component: receives lineage props, renders "Forked from" banner with link to parent piece.
3. `src/app/pieces/[id]/page.tsx` — call getLineage after auth, conditionally render LineageBanner in header.
4. `src/__tests__/lineage.test.ts` — unit tests: getLineage returns null when no lineage row, returns populated object when row exists; component renders banner (lineage-present) and renders nothing (lineage-absent) using react-dom/server renderToStaticMarkup.

### Data flow
- piece_lineage table: piece_id → parent_piece_id + fork_section_id
- Join: fetch parent pieces.title, profiles.display_name/username, sections.title
- All three fetches happen only when lineage row exists

### Acceptance criteria mapping
- AC#1,2: LineageBanner shows banner with title/author/section
- AC#3: getLineage returns null → no banner rendered
- AC#4: banner wraps parent piece title in `<a href="/pieces/{parentId}">`
- AC#5: lineage.test.ts covers both cases
<!-- SECTION:PLAN:END -->
