-- Migration: 0004_explore
-- Discovery feed: published pieces with fork counts, genre filter, sort, pagination

create or replace function public.explore_pieces(
  genre_filter text default null,
  sort_by text default 'newest',
  page_limit integer default 20,
  page_offset integer default 0
)
returns table (
  id            uuid,
  title         text,
  author_id     uuid,
  author_name   text,
  genre         text,
  tags          text[],
  idea_summary  text,
  excerpt       text,
  updated_at    timestamptz,
  fork_count    integer
) language sql security definer stable as $$
  select
    p.id,
    p.title,
    p.author_id,
    coalesce(pr.display_name, pr.username, 'Unknown') as author_name,
    pm.genre,
    coalesce(pm.tags, '{}'::text[]) as tags,
    pm.idea_summary,
    left(coalesce((
      select s.content
      from public.sections s
      where s.piece_id = p.id
      order by s.ordinal asc
      limit 1
    ), ''), 200) as excerpt,
    p.updated_at,
    (
      select count(*)::integer
      from public.piece_lineage l
      where l.parent_piece_id = p.id
    ) as fork_count
  from public.pieces p
  left join public.piece_metadata pm on pm.piece_id = p.id
  left join public.profiles pr on pr.id = p.author_id
  where
    p.status = 'published'
    and (genre_filter is null or pm.genre = genre_filter)
  order by
    (case
       when sort_by = 'most_forked'
         then (select count(*) from public.piece_lineage l where l.parent_piece_id = p.id)
       else extract(epoch from p.updated_at)
     end) desc
  limit page_limit
  offset page_offset;
$$;
