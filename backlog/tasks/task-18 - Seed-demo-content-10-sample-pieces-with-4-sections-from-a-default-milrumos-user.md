---
id: TASK-18
title: >-
  Seed demo content: 10 sample pieces with 4 sections from a default "milrumos"
  user
status: To Do
assignee: []
created_date: '2026-06-08 13:42'
labels:
  - content
  - seed-data
  - supabase
dependencies: []
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The site currently launches with no pieces, giving new visitors nothing to explore, search, reuse, or branch from. Create a seed/migration that adds a default author account named "milrumos" and 10 original sample pieces authored by it, each split into 4 sections (so people can test reuse/branching from any section, search, exploration, lineage display, etc.). Pieces should span a mix of genres/topics and be marked published so they're discoverable immediately after a fresh deploy.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A default 'milrumos' user/profile exists and is created idempotently (safe to re-run migration/seed without duplicating)
- [ ] #2 Exactly 10 distinct sample pieces are seeded, each authored by the 'milrumos' user
- [ ] #3 Each seeded piece has exactly 4 sections with real, readable sample text (not lorem ipsum placeholders)
- [ ] #4 Seeded pieces are set to 'published' status so they appear in search/explore immediately
- [ ] #5 Pieces cover a variety of genres/topics so search and filtering can be meaningfully tested
- [ ] #6 Seed data is provided as a Supabase migration or seed script consistent with existing migration conventions in supabase/migrations
- [ ] #7 Documentation note (in the migration or task notes) explains how to (re)run the seed locally
<!-- AC:END -->
