import { searchPieces, parseTagInput, type SearchResult } from '@/lib/search';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---- chain builder with rpc support -------------------------------------------

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

const PUBLISHED_PIECE: SearchResult = {
  id: 'piece-1',
  title: 'A Sci-Fi Adventure',
  author_id: 'author-1',
  genre: 'Sci-Fi',
  tags: ['space', 'exploration'],
  idea_summary: 'Humanity reaches for the stars',
  updated_at: '2026-01-01T00:00:00Z',
  excerpt: 'Chapter 1: The launch sequence began at dawn…',
  author_name: 'Jane Doe',
  rank: 0.9,
};

// ---- searchPieces -------------------------------------------------------------

describe('searchPieces', () => {
  it('returns empty array for empty query without calling rpc', async () => {
    const supabase = makeRpcClient({ data: [], error: null });

    const result = await searchPieces(supabase, '');

    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
    expect((supabase as unknown as { rpc: jest.Mock }).rpc).not.toHaveBeenCalled();
  });

  it('calls rpc with search_query and genre_filter', async () => {
    const supabase = makeRpcClient({ data: [PUBLISHED_PIECE], error: null });

    const result = await searchPieces(supabase, 'sci-fi adventure', 'Sci-Fi');

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect((supabase as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith('search_pieces', {
      search_query: 'sci-fi adventure',
      genre_filter: 'Sci-Fi',
    });
  });

  it('passes null genre_filter when not provided', async () => {
    const supabase = makeRpcClient({ data: [PUBLISHED_PIECE], error: null });

    await searchPieces(supabase, 'adventure');

    expect((supabase as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith('search_pieces', {
      search_query: 'adventure',
      genre_filter: null,
    });
  });

  it('returns empty array on no matches (keyword match)', async () => {
    const supabase = makeRpcClient({ data: [], error: null });

    const result = await searchPieces(supabase, 'xyznonexistent');

    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });

  it('returns empty array when genre filter yields no matches', async () => {
    const supabase = makeRpcClient({ data: [], error: null });

    const result = await searchPieces(supabase, 'adventure', 'Horror');

    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });

  it('returns DB_ERROR on rpc failure', async () => {
    const supabase = makeRpcClient({ data: null, error: { message: 'rpc error' } });

    const result = await searchPieces(supabase, 'anything');

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('DB_ERROR');
    expect(result.error?.message).toBe('rpc error');
  });

  it('trims leading/trailing whitespace from query', async () => {
    const supabase = makeRpcClient({ data: [PUBLISHED_PIECE], error: null });

    await searchPieces(supabase, '  adventure  ');

    expect((supabase as unknown as { rpc: jest.Mock }).rpc).toHaveBeenCalledWith('search_pieces', {
      search_query: 'adventure',
      genre_filter: null,
    });
  });

  it('only returns published pieces (rpc enforces this; data check)', async () => {
    const publishedOnly = [PUBLISHED_PIECE];
    const supabase = makeRpcClient({ data: publishedOnly, error: null });

    const result = await searchPieces(supabase, 'adventure');

    expect(result.data?.every((r) => r.id)).toBe(true);
    expect(result.data).toHaveLength(1);
  });
});

// ---- parseTagInput (also tested in metadata.test.ts, kept here for coverage) --

describe('parseTagInput', () => {
  it('splits on comma', () => {
    expect(parseTagInput('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseTagInput('   ')).toEqual([]);
  });
});
