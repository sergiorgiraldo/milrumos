-- =============================================================================
-- Migration: 0001_initial_schema
-- Tables: profiles, pieces, sections, piece_versions, piece_lineage,
--         piece_metadata
-- RLS: authors CRUD own rows; public SELECT published pieces only
-- =============================================================================

-- profiles: one row per auth.users entry, created on sign-up via trigger
create table public.profiles (
  id            uuid        references auth.users(id) on delete cascade primary key,
  username      text        unique not null,
  display_name  text,
  avatar_url    text,
  bio           text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- pieces: a writing piece owned by one author
create table public.pieces (
  id          uuid        default gen_random_uuid() primary key,
  author_id   uuid        references public.profiles(id) on delete cascade not null,
  title       text        not null,
  status      text        not null default 'draft'
                          check (status in ('draft', 'published')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- sections: ordered chapters within a piece; content stored as raw markdown
create table public.sections (
  id          uuid        default gen_random_uuid() primary key,
  piece_id    uuid        references public.pieces(id) on delete cascade not null,
  ordinal     integer     not null,
  title       text,
  content     text        not null default '',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  unique (piece_id, ordinal)
);

-- piece_versions: full ordered markdown snapshot captured on each save
create table public.piece_versions (
  id                  uuid        default gen_random_uuid() primary key,
  piece_id            uuid        references public.pieces(id) on delete cascade not null,
  version_number      integer     not null,
  markdown_snapshot   text        not null,
  author_id           uuid        references public.profiles(id) not null,
  created_at          timestamptz default now() not null,
  unique (piece_id, version_number)
);

-- auto-increment version_number per piece via sequence trigger
create or replace function public.next_piece_version()
  returns trigger language plpgsql as $$
begin
  new.version_number := coalesce(
    (select max(version_number) from public.piece_versions where piece_id = new.piece_id),
    0
  ) + 1;
  return new;
end;
$$;

create trigger trg_piece_versions_version_number
  before insert on public.piece_versions
  for each row execute function public.next_piece_version();

-- piece_lineage: records fork relationships between pieces
-- fork_section_id: the section from which the fork started (nullable = fork from start)
create table public.piece_lineage (
  id              uuid        default gen_random_uuid() primary key,
  piece_id        uuid        references public.pieces(id) on delete cascade not null unique,
  parent_piece_id uuid        references public.pieces(id) not null,
  fork_section_id uuid        references public.sections(id),
  created_at      timestamptz default now() not null
);

-- piece_metadata: genre and tags managed by the author
create table public.piece_metadata (
  id          uuid        default gen_random_uuid() primary key,
  piece_id    uuid        references public.pieces(id) on delete cascade not null unique,
  genre       text,
  tags        text[]      default '{}',
  updated_at  timestamptz default now() not null
);

-- =============================================================================
-- Row-Level Security
-- =============================================================================

alter table public.profiles      enable row level security;
alter table public.pieces        enable row level security;
alter table public.sections      enable row level security;
alter table public.piece_versions enable row level security;
alter table public.piece_lineage enable row level security;
alter table public.piece_metadata enable row level security;

-- profiles
create policy "profiles: owner full access"
  on public.profiles for all
  using (auth.uid() = id);

create policy "profiles: public read"
  on public.profiles for select
  using (true);

-- pieces
create policy "pieces: owner full access"
  on public.pieces for all
  using (auth.uid() = author_id);

create policy "pieces: public read published"
  on public.pieces for select
  using (status = 'published');

-- sections (access inherited from parent piece)
create policy "sections: owner full access"
  on public.sections for all
  using (
    auth.uid() = (select author_id from public.pieces where id = piece_id)
  );

create policy "sections: public read published"
  on public.sections for select
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

-- piece_versions
create policy "piece_versions: owner full access"
  on public.piece_versions for all
  using (auth.uid() = author_id);

create policy "piece_versions: public read published"
  on public.piece_versions for select
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

-- piece_lineage (always readable; only piece owner may write)
create policy "piece_lineage: owner full access"
  on public.piece_lineage for all
  using (
    auth.uid() = (select author_id from public.pieces where id = piece_id)
  );

create policy "piece_lineage: public read"
  on public.piece_lineage for select
  using (true);

-- piece_metadata
create policy "piece_metadata: owner full access"
  on public.piece_metadata for all
  using (
    auth.uid() = (select author_id from public.pieces where id = piece_id)
  );

create policy "piece_metadata: public read published"
  on public.piece_metadata for select
  using (
    (select status from public.pieces where id = piece_id) = 'published'
  );

-- =============================================================================
-- Helper: auto-create profile on new user sign-up
-- =============================================================================

create or replace function public.handle_new_user()
  returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
