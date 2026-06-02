---
id: TASK-14
title: Build explore/browse page
status: To Do
assignee: []
created_date: '2026-06-02 06:22'
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
- [ ] #1 Explore page lists recently published pieces in a card grid
- [ ] #2 Each card shows: title, author, genre, tag chips, excerpt, publish date, fork count
- [ ] #3 Genre filter tabs/pills narrow the list to a single genre
- [ ] #4 Sort options: Newest and Most Forked
- [ ] #5 Pagination or infinite scroll for more than 20 results
- [ ] #6 Clicking a card navigates to the piece detail page
- [ ] #7 Unit tests cover card rendering, genre filter, and sort logic
<!-- AC:END -->
