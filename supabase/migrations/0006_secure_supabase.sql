-- =============================================================================
-- Migration: 0006_secure_supabase
--
-- Hardens database-level access controls. Two findings addressed:
--
-- 1. "Public read" RLS policies (profiles, pieces, sections, piece_versions,
--    piece_lineage, piece_metadata) had no `TO` clause, so they applied to
--    `anon` as well as `authenticated`. The app requires login on every page
--    (see CLAUDE.md), but the Supabase anon key is public (shipped to every
--    browser), so an unauthenticated client could call the REST API directly
--    and read every published piece, its sections/versions, lineage, and any
--    profile — bypassing the login requirement entirely. These policies are
--    now scoped `to authenticated`.
--
-- 2. search_pieces / explore_pieces are `security definer`, so they bypass
--    RLS for their internal queries and rely solely on their own
--    `status = 'published'` filters. By default Postgres grants EXECUTE on
--    new functions to PUBLIC, so `anon` could call these RPCs directly and
--    read all published content even with (1) fixed. EXECUTE is now
--    restricted to `authenticated` to match the table-level policies.
--
-- Bonus hardening: pin an empty search_path on all four functions. Their
-- bodies already schema-qualify every table reference (public.xxx) and only
-- call built-ins from pg_catalog (always implicitly searched), so this is a
-- no-op for behavior but closes the Supabase Advisor "function search path
-- mutable" finding (defends security definer functions against search_path
-- based object-shadowing attacks).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Restrict "public read" policies to authenticated sessions
-- ---------------------------------------------------------------------------

drop policy "profiles: public read" on public.profiles;
create policy "profiles: public read"
  on public.profiles for select
  to authenticated
  using (true);

drop policy "pieces: public read published" on public.pieces;
create policy "pieces: public read published"
  on public.pieces for select
  to authenticated
  using (status = 'published');

drop policy "sections: public read published" on public.sections;
create policy "sections: public read published"
  on public.sections for select
  to authenticated
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

drop policy "piece_versions: public read published" on public.piece_versions;
create policy "piece_versions: public read published"
  on public.piece_versions for select
  to authenticated
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

drop policy "piece_lineage: public read" on public.piece_lineage;
create policy "piece_lineage: public read"
  on public.piece_lineage for select
  to authenticated
  using (true);

drop policy "piece_metadata: public read published" on public.piece_metadata;
create policy "piece_metadata: public read published"
  on public.piece_metadata for select
  to authenticated
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

-- ---------------------------------------------------------------------------
-- 2. search_pieces / explore_pieces bypass RLS (security definer) — restrict
--    who may call them to match the policies above.
-- ---------------------------------------------------------------------------

revoke execute on function public.search_pieces(text, text) from public;
grant execute on function public.search_pieces(text, text) to authenticated;

revoke execute on function public.explore_pieces(text, text, integer, integer) from public;
grant execute on function public.explore_pieces(text, text, integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Pin search_path on all functions
-- ---------------------------------------------------------------------------

alter function public.handle_new_user() set search_path = '';
alter function public.next_piece_version() set search_path = '';
alter function public.search_pieces(text, text) set search_path = '';
alter function public.explore_pieces(text, text, integer, integer) set search_path = '';
