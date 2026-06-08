import { listVersions, restoreVersion, parseSnapshot } from '@/lib/versions';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---- supabase mock helpers (same pattern as fork.test.ts / lineage.test.ts) ------

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

// ---- parseSnapshot (inverse of buildSnapshot) -------------------------------------

describe('parseSnapshot', () => {
  it('extracts the title and titled sections', () => {
    const markdown = '# My Story\n\n## Chapter One\n\nIt was a dark night.\n\n## Chapter Two\n\nThings got worse.';
    const parsed = parseSnapshot(markdown);

    expect(parsed.title).toBe('My Story');
    expect(parsed.sections).toEqual([
      { title: 'Chapter One', content: 'It was a dark night.' },
      { title: 'Chapter Two', content: 'Things got worse.' },
    ]);
  });

  it('handles a leading untitled section', () => {
    const markdown = '# My Story\n\nNo heading here, just prose.\n\n## Chapter One\n\nLater content.';
    const parsed = parseSnapshot(markdown);

    expect(parsed.sections[0]).toEqual({ title: null, content: 'No heading here, just prose.' });
    expect(parsed.sections[1]).toEqual({ title: 'Chapter One', content: 'Later content.' });
  });

  it('round-trips through buildSnapshot-style markdown for a single section', () => {
    const markdown = '# Solo\n\n## Only Section\n\nJust one block of text.';
    const parsed = parseSnapshot(markdown);

    expect(parsed.title).toBe('Solo');
    expect(parsed.sections).toEqual([{ title: 'Only Section', content: 'Just one block of text.' }]);
  });

  it('drops empty trailing sections', () => {
    const markdown = '# Title\n\n## Section\n\nContent\n\n## Empty Section';
    const parsed = parseSnapshot(markdown);

    expect(parsed.sections).toHaveLength(2);
    expect(parsed.sections[1]).toEqual({ title: 'Empty Section', content: '' });
  });
});

// ---- listVersions ------------------------------------------------------------------

describe('listVersions', () => {
  it('returns NOT_FOUND when the piece does not exist', async () => {
    const supabase = makeClient(makeChain({ data: null, error: null }));

    const result = await listVersions(supabase, PIECE_ID, AUTHOR_ID);
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('returns FORBIDDEN when the requester is not the author', async () => {
    const supabase = makeClient(makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }));

    const result = await listVersions(supabase, PIECE_ID, OTHER_ID);
    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('lists versions newest-first with computed word counts', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({
        data: [
          {
            id: 'v2',
            version_number: 2,
            markdown_snapshot: '# Title\n\n## One\n\none two three four',
            created_at: '2026-02-01T00:00:00Z',
          },
          {
            id: 'v1',
            version_number: 1,
            markdown_snapshot: '# Title\n\n## One\n\none two',
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
      })
    );

    const result = await listVersions(supabase, PIECE_ID, AUTHOR_ID);
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0]).toMatchObject({ id: 'v2', version_number: 2, word_count: 6 });
    expect(result.data?.[1]).toMatchObject({ id: 'v1', version_number: 1, word_count: 4 });
  });
});

// ---- restoreVersion ----------------------------------------------------------------

describe('restoreVersion', () => {
  it('returns FORBIDDEN when the requester is not the author', async () => {
    const supabase = makeClient(makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }));

    const result = await restoreVersion(supabase, PIECE_ID, 'v1', OTHER_ID);
    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when the version does not belong to the piece', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: { id: 'v1', piece_id: 'other-piece', markdown_snapshot: '# T' }, error: null })
    );

    const result = await restoreVersion(supabase, PIECE_ID, 'v1', AUTHOR_ID);
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('parses the snapshot and writes it back via savePiece, creating a new version', async () => {
    const snapshot = '# My Story\n\n## Chapter One\n\nRestored content here.';

    const supabase = makeClient(
      // assertOwner: pieces select
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      // fetch target version
      makeChain({ data: { id: 'v1', piece_id: PIECE_ID, markdown_snapshot: snapshot }, error: null }),
      // savePiece: pieces select (id, author_id, title)
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID, title: 'My Story' }, error: null }),
      // savePiece: sections upsert
      makeChain({ data: null, error: null }),
      // savePiece: piece_versions insert
      makeChain({ data: { version_number: 3 }, error: null }),
      // savePiece: pieces update (touch updated_at)
      makeChain({ data: null, error: null })
    );

    const result = await restoreVersion(supabase, PIECE_ID, 'v1', AUTHOR_ID);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({ version_number: 3 });
  });
});
