import {
  listExplorePieces,
  parseExploreSort,
  parseExplorePage,
  buildExploreHref,
  EXPLORE_PAGE_SIZE,
  type ExplorePiece,
} from '@/lib/explore';
import type { SupabaseClient } from '@supabase/supabase-js';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import PieceCard from '@/components/PieceCard';

// ---- supabase rpc mock helpers --------------------------------------------------

function makeRpcChain(result: { data: unknown; error: unknown }) {
  const resolved = Promise.resolve(result);
  return {
    then: resolved.then.bind(resolved),
    catch: resolved.catch.bind(resolved),
  };
}

function makeRpcClient(result: { data: unknown; error: unknown }) {
  return {
    rpc: jest.fn().mockReturnValue(makeRpcChain(result)),
  } as unknown as SupabaseClient;
}

const PIECE: ExplorePiece = {
  id: 'piece-1',
  title: 'A Sci-Fi Adventure',
  author_id: 'author-1',
  author_name: 'Jane Doe',
  genre: 'Sci-Fi',
  tags: ['space', 'exploration'],
  idea_summary: 'Humanity reaches for the stars',
  excerpt: 'Chapter 1: The launch sequence began at dawn…',
  updated_at: '2026-01-01T00:00:00Z',
  fork_count: 3,
};

// ---- parseExploreSort / parseExplorePage (sort logic) ---------------------------

describe('parseExploreSort', () => {
  it('returns most_forked when explicitly requested', () => {
    expect(parseExploreSort('most_forked')).toBe('most_forked');
  });

  it('defaults to newest for anything else', () => {
    expect(parseExploreSort('newest')).toBe('newest');
    expect(parseExploreSort(undefined)).toBe('newest');
    expect(parseExploreSort(null)).toBe('newest');
    expect(parseExploreSort('bogus')).toBe('newest');
  });
});

describe('parseExplorePage', () => {
  it('defaults to 1 for missing or invalid input', () => {
    expect(parseExplorePage(undefined)).toBe(1);
    expect(parseExplorePage(null)).toBe(1);
    expect(parseExplorePage('not-a-number')).toBe(1);
    expect(parseExplorePage('0')).toBe(1);
    expect(parseExplorePage('-3')).toBe(1);
  });

  it('parses positive integers', () => {
    expect(parseExplorePage('2')).toBe(2);
    expect(parseExplorePage('5')).toBe(5);
  });

  it('floors fractional values', () => {
    expect(parseExplorePage('3.7')).toBe(3);
  });
});

// ---- buildExploreHref (genre filter + sort + pagination links) ------------------

describe('buildExploreHref', () => {
  it('returns the bare path with no params', () => {
    expect(buildExploreHref({})).toBe('/explore');
    expect(buildExploreHref({ sort: 'newest', page: 1 })).toBe('/explore');
  });

  it('includes genre when set', () => {
    expect(buildExploreHref({ genre: 'Sci-Fi' })).toBe('/explore?genre=Sci-Fi');
  });

  it('includes sort only when not the default', () => {
    expect(buildExploreHref({ sort: 'most_forked' })).toBe('/explore?sort=most_forked');
    expect(buildExploreHref({ sort: 'newest' })).toBe('/explore');
  });

  it('includes page only when greater than 1', () => {
    expect(buildExploreHref({ page: 2 })).toBe('/explore?page=2');
    expect(buildExploreHref({ page: 1 })).toBe('/explore');
  });

  it('combines genre, sort, and page', () => {
    expect(buildExploreHref({ genre: 'Fantasy', sort: 'most_forked', page: 3 })).toBe(
      '/explore?genre=Fantasy&sort=most_forked&page=3'
    );
  });
});

// ---- listExplorePieces -----------------------------------------------------------

describe('listExplorePieces', () => {
  it('calls explore_pieces rpc with defaults', async () => {
    const supabase = makeRpcClient({ data: [PIECE], error: null });

    const result = await listExplorePieces(supabase);

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect((supabase as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith('explore_pieces', {
      genre_filter: null,
      sort_by: 'newest',
      page_limit: EXPLORE_PAGE_SIZE,
      page_offset: 0,
    });
  });

  it('passes genre filter, sort, and computes offset from page', async () => {
    const supabase = makeRpcClient({ data: [], error: null });

    await listExplorePieces(supabase, { genre: 'Fantasy', sort: 'most_forked', page: 3 });

    expect((supabase as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith('explore_pieces', {
      genre_filter: 'Fantasy',
      sort_by: 'most_forked',
      page_limit: EXPLORE_PAGE_SIZE,
      page_offset: EXPLORE_PAGE_SIZE * 2,
    });
  });

  it('returns an error result when the rpc fails', async () => {
    const supabase = makeRpcClient({ data: null, error: { message: 'boom' } });

    const result = await listExplorePieces(supabase);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('DB_ERROR');
  });
});

// ---- PieceCard rendering ----------------------------------------------------------

describe('PieceCard', () => {
  it('renders title, author, genre, tags, excerpt, and fork count', () => {
    const html = renderToStaticMarkup(React.createElement(PieceCard, { piece: PIECE }));

    expect(html).toContain('A Sci-Fi Adventure');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Sci-Fi');
    expect(html).toContain('space');
    expect(html).toContain('exploration');
    expect(html).toContain('Chapter 1');
    expect(html).toContain('3 forks');
    expect(html).toContain('href="/pieces/piece-1"');
  });

  it('uses singular "fork" for a count of one', () => {
    const html = renderToStaticMarkup(React.createElement(PieceCard, { piece: { ...PIECE, fork_count: 1 } }));
    expect(html).toContain('1 fork');
    expect(html).not.toContain('1 forks');
  });

  it('omits the genre chip when genre is null', () => {
    const html = renderToStaticMarkup(React.createElement(PieceCard, { piece: { ...PIECE, genre: null } }));
    expect(html).not.toContain('bg-ruby-red-100');
  });
});
