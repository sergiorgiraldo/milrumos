---
id: TASK-2
title: Design and apply Supabase database schema
status: To Do
assignee: []
created_date: '2026-06-02 06:20'
labels:
  - database
  - backend
milestone: m-0
dependencies: []
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define and migrate the initial database schema in Supabase. Must cover all entities needed for M1–M5: users (via Supabase Auth), pieces, sections/chapters within a piece, piece lineage (fork relationships), piece metadata (genre, tags), and piece status (draft/published).

Row-Level Security (RLS) policies must be defined so authors can only modify their own pieces while published pieces are publicly readable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Migration SQL files exist and apply cleanly to a fresh Supabase project
- [ ] #2 Tables exist: profiles, pieces, sections, piece_lineage, piece_metadata
- [ ] #3 piece_lineage records parent_piece_id and fork_section_id (the section from which the fork started)
- [ ] #4 RLS policies: author can CRUD their own rows; anonymous/other users can SELECT published pieces only
- [ ] #5 Schema is documented in a backlog doc or migration file comments
- [ ] #6 Unit tests verify RLS rules using the Supabase test helpers
<!-- AC:END -->
