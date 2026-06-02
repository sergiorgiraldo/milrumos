---
id: TASK-2
title: Design and apply Supabase database schema
status: To Do
assignee: []
created_date: '2026-06-02 06:20'
updated_date: '2026-06-02 06:57'
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
Define and migrate the initial database schema in Supabase. Must cover all entities needed for M1–M5: users (via Supabase Auth), pieces, sections/chapters within a piece (content stored as markdown text), piece versions (full snapshot per save), piece lineage (fork relationships), piece metadata (genre, tags), and piece status (draft/published).

Row-Level Security (RLS) policies must be defined so authors can only modify their own pieces while published pieces are publicly readable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Migration SQL files exist and apply cleanly to a fresh Supabase project
- [ ] #2 Tables exist: profiles, pieces, sections, piece_versions, piece_lineage, piece_metadata
- [ ] #3 sections.content column is TEXT storing raw markdown
- [ ] #4 piece_versions table records: piece_id, version_number (auto-increment per piece), markdown_snapshot (full ordered markdown of all sections at save time), created_at, author_id
- [ ] #5 piece_lineage records parent_piece_id and fork_section_id (the section from which the fork started)
- [ ] #6 RLS policies: author can CRUD their own rows; anonymous/other users can SELECT published pieces only
- [ ] #7 Schema is documented in a backlog doc or migration file comments
- [ ] #8 Unit tests verify RLS rules using the Supabase test helpers
<!-- AC:END -->
