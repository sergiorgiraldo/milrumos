---
id: TASK-13
title: Implement full-text search
status: Done
assignee: []
created_date: '2026-06-02 06:21'
updated_date: '2026-06-06 13:39'
labels:
  - backend
  - frontend
  - search
milestone: m-3
dependencies:
  - TASK-2
  - TASK-12
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A search page that lets any authenticated user find published pieces by author name, keyword (matches title, body text, tags), genre filter, and idea/summary text. Results must be ranked by relevance. Use Supabase full-text search (pg_trgm or tsvector) rather than a third-party service.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Search bar is accessible from the global nav on every page
- [x] #2 Search results page shows pieces matching query across title, body, tags, idea/summary, and author name
- [x] #3 Results can be filtered by genre via a sidebar/dropdown filter
- [x] #4 Results show: piece title, author, genre, short excerpt, publish date
- [x] #5 Empty state shown when no results match
- [x] #6 Search only returns published pieces
- [x] #7 Supabase migration adds required tsvector index or pg_trgm trigram index
- [x] #8 Unit tests cover: keyword match, genre filter, empty-result state, draft exclusion
<!-- AC:END -->
