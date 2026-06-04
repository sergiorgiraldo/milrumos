import { canFork, isInheritedSection } from '@/lib/fork';
import { forkPiece } from '@/lib/pieces';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---- helpers (same pattern as pieces.test.ts) -----------------------------------

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

const AUTHOR_ID = 'author-1';
const OTHER_ID = 'other-user';
const PIECE_ID = 'piece-1';
const NEW_PIECE_ID = 'piece-new';
const SECTION_1 = 'sec-1';
const SECTION_2 = 'sec-2';

// ---- canFork --------------------------------------------------------------------

describe('canFork', () => {
  it('returns true for published piece viewed by non-owner', () => {
    expect(canFork('published', false)).toBe(true);
  });

  it('returns false for owner of published piece', () => {
    expect(canFork('published', true)).toBe(false);
  });

  it('returns false for draft piece', () => {
    expect(canFork('draft', false)).toBe(false);
  });

  it('returns false for draft piece owned by viewer', () => {
    expect(canFork('draft', true)).toBe(false);
  });
});

// ---- isInheritedSection ---------------------------------------------------------

describe('isInheritedSection', () => {
  it('returns true when ordinal is within inheritedCount', () => {
    expect(isInheritedSection(1, 3)).toBe(true);
    expect(isInheritedSection(3, 3)).toBe(true);
  });

  it('returns false when ordinal exceeds inheritedCount', () => {
    expect(isInheritedSection(4, 3)).toBe(false);
  });

  it('returns false when inheritedCount is 0', () => {
    expect(isInheritedSection(1, 0)).toBe(false);
  });
});

// ---- forkPiece ------------------------------------------------------------------

const publishedPiece = {
  id: PIECE_ID,
  author_id: AUTHOR_ID,
  title: 'Story',
  status: 'published',
  sections: [
    { id: SECTION_1, ordinal: 1, title: 'Part 1', content: 'hello' },
    { id: SECTION_2, ordinal: 2, title: 'Part 2', content: 'world' },
  ],
};

describe('forkPiece', () => {
  it('creates a new piece with inherited sections and lineage', async () => {
    const newPiece = { id: NEW_PIECE_ID, author_id: OTHER_ID, title: 'Story', status: 'draft' };
    const supabase = makeClient(
      makeChain({ data: publishedPiece, error: null }),   // pieces select
      makeChain({ data: newPiece, error: null }),          // pieces insert
      makeChain({ data: [], error: null }),                // sections insert
      makeChain({ data: [], error: null }),                // piece_lineage insert
    );

    const result = await forkPiece(supabase, PIECE_ID, SECTION_1, OTHER_ID);

    expect(result.error).toBeNull();
    expect(result.data?.id).toBe(NEW_PIECE_ID);
    expect(result.data?.author_id).toBe(OTHER_ID);
    expect(result.data?.status).toBe('draft');
  });

  it('returns BAD_REQUEST when forking own piece', async () => {
    const supabase = makeClient(
      makeChain({ data: publishedPiece, error: null })
    );

    const result = await forkPiece(supabase, PIECE_ID, SECTION_1, AUTHOR_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('BAD_REQUEST');
  });

  it('returns FORBIDDEN when forking a draft piece by another user', async () => {
    const draftPiece = { ...publishedPiece, status: 'draft' };
    const supabase = makeClient(
      makeChain({ data: draftPiece, error: null })
    );

    const result = await forkPiece(supabase, PIECE_ID, SECTION_1, OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when piece does not exist', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'not found' } })
    );

    const result = await forkPiece(supabase, 'no-such', SECTION_1, OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when section_id not in piece', async () => {
    const supabase = makeClient(
      makeChain({ data: publishedPiece, error: null })
    );

    const result = await forkPiece(supabase, PIECE_ID, 'bad-section-id', OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('returns DB_ERROR when new piece insert fails', async () => {
    const supabase = makeClient(
      makeChain({ data: publishedPiece, error: null }),
      makeChain({ data: null, error: { message: 'db error' } })
    );

    const result = await forkPiece(supabase, PIECE_ID, SECTION_1, OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('DB_ERROR');
  });
});
