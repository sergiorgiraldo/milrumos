-- Migration: 0003_search
-- Full-text search support using tsvector / pg_trgm

create extension if not exists pg_trgm;

-- GIN index on pieces title for fast FTS
create index if not exists idx_pieces_title_search
  on public.pieces
  using gin(to_tsvector('english', coalesce(title, '')));

-- Stored function: search published pieces across all relevant fields
create or replace function public.search_pieces(
  search_query text,
  genre_filter text default null
)
returns table (
  id          uuid,
  title       text,
  author_id   uuid,
  genre       text,
  tags        text[],
  idea_summary text,
  updated_at  timestamptz,
  excerpt     text,
  author_name text,
  rank        float
) language sql security definer stable as $$
  select
    p.id,
    p.title,
    p.author_id,
    pm.genre,
    coalesce(pm.tags, '{}'::text[]) as tags,
    pm.idea_summary,
    p.updated_at,
    left(coalesce((
      select s.content
      from public.sections s
      where s.piece_id = p.id
      order by s.ordinal asc
      limit 1
    ), ''), 200) as excerpt,
    coalesce(pr.display_name, pr.username, 'Unknown') as author_name,
    ts_rank(
      to_tsvector('english',
        coalesce(p.title, '') || ' ' ||
        coalesce(pm.idea_summary, '') || ' ' ||
        coalesce(array_to_string(pm.tags, ' '), '') || ' ' ||
        coalesce(pr.display_name, pr.username, '') || ' ' ||
        coalesce((
          select string_agg(s.content, ' ')
          from public.sections s
          where s.piece_id = p.id
        ), '')
      ),
      plainto_tsquery('english', search_query)
    ) as rank
  from public.pieces p
  left join public.piece_metadata pm on pm.piece_id = p.id
  left join public.profiles pr on pr.id = p.author_id
  where
    p.status = 'published'
    and (genre_filter is null or pm.genre = genre_filter)
    and (
      to_tsvector('english',
        coalesce(p.title, '') || ' ' ||
        coalesce(pm.idea_summary, '') || ' ' ||
        coalesce(array_to_string(pm.tags, ' '), '') || ' ' ||
        coalesce(pr.display_name, pr.username, '') || ' ' ||
        coalesce((
          select string_agg(s.content, ' ')
          from public.sections s
          where s.piece_id = p.id
        ), '')
      ) @@ plainto_tsquery('english', search_query)
      or p.title ilike '%' || search_query || '%'
    )
  order by rank desc, p.updated_at desc;
$$;
