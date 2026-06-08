---
id: TASK-14
title: Build explore/browse page
status: Done
assignee: []
created_date: '2026-06-02 06:22'
updated_date: '2026-06-08 14:29'
labels:
  - frontend
milestone: m-3
dependencies:
  - TASK-7
  - TASK-12
priority: medium
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A discovery landing page showing recent and featured published pieces to all authenticated users. Acts as the platform's front door beyond the author's own dashboard. Pieces should be browsable by genre and sortable by recency or popularity (fork count).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Explore page lists recently published pieces in a card grid
- [x] #2 Each card shows: title, author, genre, tag chips, excerpt, publish date, fork count
- [x] #3 Genre filter tabs/pills narrow the list to a single genre
- [x] #4 Sort options: Newest and Most Forked
- [x] #5 Pagination or infinite scroll for more than 20 results
- [x] #6 Clicking a card navigates to the piece detail page
- [x] #7 Unit tests cover card rendering, genre filter, and sort logic
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Explore page already built and merged in commit 55f97de. Verified: card grid lists published pieces (src/app/explore/page.tsx, src/components/PieceCard.tsx), genre pills + sort (newest/most_forked) + pagination via lib/explore.ts and explore_pieces RPC (supabase/migrations/0004_explore.sql), cards link to /pieces/[id], and unit tests in src/__tests__/explore.test.ts (16 passing) cover card rendering, genre filter, sort/pagination logic.
<!-- SECTION:FINAL_SUMMARY:END -->
