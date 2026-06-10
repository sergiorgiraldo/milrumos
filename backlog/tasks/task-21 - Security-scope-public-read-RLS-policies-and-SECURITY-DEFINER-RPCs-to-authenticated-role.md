---
id: TASK-21
title: >-
  Security: scope public-read RLS policies and SECURITY DEFINER RPCs to
  authenticated role
status: Done
assignee: []
created_date: '2026-06-10 10:24'
updated_date: '2026-06-10 10:25'
labels:
  - security
dependencies: []
modified_files:
  - supabase/migrations/0006_secure_supabase.sql
  - src/lib/schema.ts
  - src/__tests__/schema.test.ts
priority: high
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit Supabase config for vulnerabilities. Found: "public read"/"public read published" RLS policies on profiles, pieces, sections, piece_versions, piece_lineage, piece_metadata had no `to` clause, so anon (public anon key) could read all published content + profiles + lineage via REST API, bypassing app login requirement. Also search_pieces/explore_pieces are SECURITY DEFINER (bypass RLS) with default PUBLIC execute grants, same bypass via RPC. Also four functions (handle_new_user, next_piece_version, search_pieces, explore_pieces) had mutable search_path.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 New migration scopes profiles/pieces/sections/piece_versions/piece_lineage/piece_metadata public-read policies to `to authenticated`
- [x] #2 EXECUTE on search_pieces and explore_pieces revoked from public, granted to authenticated
- [x] #3 search_path pinned to '' on handle_new_user, next_piece_version, search_pieces, explore_pieces
- [x] #4 RLS_RULES registry and tests updated to reflect roles, full test suite + typecheck + build pass
<!-- AC:END -->



## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added migration 0006_secure_supabase.sql:\n- Recreated 6 \"public read\"/\"public read published\" SELECT policies (profiles, pieces, sections, piece_versions, piece_lineage, piece_metadata) with `to authenticated`, closing anon-key bypass of app login.\n- Revoked PUBLIC execute and granted `authenticated` execute on search_pieces(text,text) and explore_pieces(text,text,integer,integer), since both are SECURITY DEFINER and bypass RLS.\n- Set empty search_path on handle_new_user, next_piece_version, search_pieces, explore_pieces (all bodies already schema-qualified, safe no-op for behavior).\n\nUpdated src/lib/schema.ts RLS_RULES registry with new required `roles: ('public'|'authenticated')[]` field documenting the `to` clause per policy. Added matching tests in schema.test.ts (registry roles + new migration content). Full suite: 16 suites / 249 tests pass, tsc clean, next build clean (pre-existing unrelated lint errors in NavBar/PieceEditor untouched).
<!-- SECTION:FINAL_SUMMARY:END -->
