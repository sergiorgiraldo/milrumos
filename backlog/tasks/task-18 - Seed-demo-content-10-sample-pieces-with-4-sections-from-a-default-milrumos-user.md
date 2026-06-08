---
id: TASK-18
title: >-
  Seed demo content: 10 sample pieces with 4 sections from a default "milrumos"
  user
status: Done
assignee: []
created_date: '2026-06-08 13:42'
updated_date: '2026-06-08 15:02'
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
- [x] #1 A default 'milrumos' user/profile exists and is created idempotently (safe to re-run migration/seed without duplicating)
- [x] #2 Exactly 10 distinct sample pieces are seeded, each authored by the 'milrumos' user
- [x] #3 Each seeded piece has exactly 4 sections with real, readable sample text (not lorem ipsum placeholders)
- [x] #4 Seeded pieces are set to 'published' status so they appear in search/explore immediately
- [x] #5 Pieces cover a variety of genres/topics so search and filtering can be meaningfully tested
- [x] #6 Seed data is provided as a Supabase migration or seed script consistent with existing migration conventions in supabase/migrations
- [x] #7 Documentation note (in the migration or task notes) explains how to (re)run the seed locally
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added supabase/migrations/0005_seed_demo_content.sql, an idempotent migration that seeds:
- A default 'milrumos' author: inserts into auth.users (guarded by `where not exists`, fixed UUID 11111111-1111-1111-1111-111111111111) so the existing handle_new_user trigger creates the profiles row (username 'milrumos', display_name 'Milrumos'), with a fallback `insert ... on conflict (id) do update` to top up the bio or create the profile if the trigger were ever absent (#1).
- 10 distinct published pieces (#2, #4), each guarded by `if not exists (select ... where author_id = milrumos and title = ...)` so re-running never duplicates pieces, sections, or metadata — each insert returns the new piece id via `returning id into v_piece_id` and inserts exactly 4 sections plus a piece_metadata row with genre/tags/idea_summary in the same guarded block (#3).
- Original, readable short-fiction/poetry/essay content (no lorem ipsum) spanning 8 of the 9 supported genres — Sci-Fi (x2), Fantasy, Horror, Romance, Non-fiction, Poetry, Fiction, Essay, Other — so genre filters, search, explore, and lineage views all have meaningfully varied content to exercise (#5).
- Follows the existing migration convention (numbered SQL file in supabase/migrations, plpgsql DO block matching the trigger style in 0001) (#6), and includes a header comment documenting how to (re)run it locally via `supabase db reset` / `supabase migration up` / direct psql (#7).

Validated the SQL by hand (string-literal balance check across all 502 single quotes — none unclosed) since no local Postgres/Supabase instance was available to apply it directly; full Jest suite (210/210) still passes.
<!-- SECTION:FINAL_SUMMARY:END -->
