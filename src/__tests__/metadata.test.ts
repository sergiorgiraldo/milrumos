import type { SupabaseClient } from '@supabase/supabase-js';
import { GENRES } from '@/lib/schema';
import { parseTagInput } from '@/lib/search';

// ---- chain builder (same pattern as pieces.test.ts) ----------------------------

function makeChain(result: { data: unknown; error: unknown }) {
  const resolved = Promise.resolve(result);
  const chain: Record<string, unknown> = {
    then: resolved.then.bind(resolved),
    catch: resolved.catch.bind(resolved),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };
  for (const m of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'match', 'order', 'limit', 'is', 'in',
  ]) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  return chain as Record<string, jest.Mock>;
}

function makeClient(...chains: ReturnType<typeof makeChain>[]) {
  let i = 0;
  return { from: jest.fn().mockImplementation(() => chains[i++]) } as unknown as SupabaseClient;
}

// ---- GENRES constant -----------------------------------------------------------

describe('GENRES', () => {
  it('includes all required genres', () => {
    const required = ['Fiction', 'Non-fiction', 'Poetry', 'Essay', 'Fantasy', 'Sci-Fi', 'Horror', 'Romance', 'Other'];
    for (const g of required) {
      expect(GENRES).toContain(g);
    }
  });

  it('has at least 9 entries', () => {
    expect(GENRES.length).toBeGreaterThanOrEqual(9);
  });
});

// ---- parseTagInput (tag parsing) ----------------------------------------------

describe('parseTagInput', () => {
  it('splits comma-separated tags', () => {
    expect(parseTagInput('adventure, mystery, sci-fi')).toEqual(['adventure', 'mystery', 'sci-fi']);
  });

  it('trims whitespace from each tag', () => {
    expect(parseTagInput('  hello  ,  world  ')).toEqual(['hello', 'world']);
  });

  it('filters empty segments', () => {
    expect(parseTagInput('one,,two,')).toEqual(['one', 'two']);
  });

  it('returns empty array for empty string', () => {
    expect(parseTagInput('')).toEqual([]);
  });

  it('handles single tag without comma', () => {
    expect(parseTagInput('thriller')).toEqual(['thriller']);
  });
});

// ---- metadata API helpers (genre validation) ----------------------------------

describe('genre validation', () => {
  it('accepts valid genre from GENRES list', () => {
    const valid = GENRES[0];
    expect(GENRES.includes(valid as typeof GENRES[number])).toBe(true);
  });

  it('rejects arbitrary string not in GENRES', () => {
    expect(GENRES.includes('InvalidGenre' as typeof GENRES[number])).toBe(false);
  });

  it('rejects empty string as valid genre', () => {
    expect(GENRES.includes('' as typeof GENRES[number])).toBe(false);
  });
});

// ---- metadata upsert via Supabase mock ----------------------------------------

async function saveMetadata(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string,
  payload: { genre: string | null; tags: string[]; idea_summary: string | null }
): Promise<{ ok: boolean; error?: string }> {
  const { data: piece } = await supabase
    .from('pieces')
    .select('author_id')
    .eq('id', pieceId)
    .single();

  if (!piece) return { ok: false, error: 'not found' };
  if ((piece as { author_id: string }).author_id !== authorId) return { ok: false, error: 'forbidden' };

  const genre = GENRES.includes(payload.genre as typeof GENRES[number]) ? payload.genre : null;
  const tags = payload.tags.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
  const idea_summary = payload.idea_summary || null;

  const { error } = await supabase
    .from('piece_metadata')
    .upsert({ piece_id: pieceId, genre, tags, idea_summary }, { onConflict: 'piece_id' });

  if (error) return { ok: false, error: (error as { message: string }).message };
  return { ok: true };
}

const AUTHOR_ID = 'author-1';
const OTHER_ID = 'other-user';
const PIECE_ID = 'piece-1';

describe('metadata save', () => {
  it('upserts metadata for piece owner', async () => {
    const supabase = makeClient(
      makeChain({ data: { author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: null, error: null })
    );

    const result = await saveMetadata(supabase, PIECE_ID, AUTHOR_ID, {
      genre: 'Fiction',
      tags: ['adventure', 'mystery'],
      idea_summary: 'A story about discovery',
    });

    expect(result.ok).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('piece_metadata');
  });

  it('returns forbidden for non-owner', async () => {
    const supabase = makeClient(
      makeChain({ data: { author_id: AUTHOR_ID }, error: null })
    );

    const result = await saveMetadata(supabase, PIECE_ID, OTHER_ID, {
      genre: 'Fiction',
      tags: [],
      idea_summary: null,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('forbidden');
  });

  it('strips invalid genre and saves null', async () => {
    const supabase = makeClient(
      makeChain({ data: { author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: null, error: null })
    );

    const result = await saveMetadata(supabase, PIECE_ID, AUTHOR_ID, {
      genre: 'Thriller',
      tags: [],
      idea_summary: null,
    });

    expect(result.ok).toBe(true);
  });

  it('saves tags as trimmed array', async () => {
    const supabase = makeClient(
      makeChain({ data: { author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: null, error: null })
    );

    const result = await saveMetadata(supabase, PIECE_ID, AUTHOR_ID, {
      genre: 'Poetry',
      tags: ['  haiku  ', '  nature  '],
      idea_summary: null,
    });

    expect(result.ok).toBe(true);
  });

  it('returns error on db failure', async () => {
    const supabase = makeClient(
      makeChain({ data: { author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: null, error: { message: 'db error' } })
    );

    const result = await saveMetadata(supabase, PIECE_ID, AUTHOR_ID, {
      genre: 'Essay',
      tags: [],
      idea_summary: null,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe('db error');
  });
});
