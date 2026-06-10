import { createPiece, updatePiece, savePiece, deletePiece, setStatus, getPublicPiece, listAuthorPieces, countWords } from '@/lib/pieces';
import type { SupabaseClient } from '@supabase/supabase-js';

const AUTHOR_ID = 'author-1';
const OTHER_ID = 'other-user';
const PIECE_ID = 'piece-1';

// Creates a Supabase query chain that is both chainable and awaitable.
// All builder methods (.select, .eq, …) return the same object.
// .single() and awaiting the chain directly both resolve to `result`.
function makeChain(result: { data: unknown; error: unknown }) {
  const resolved = Promise.resolve(result);
  const chain: Record<string, unknown> = {
    then: resolved.then.bind(resolved),
    catch: resolved.catch.bind(resolved),
    single: jest.fn().mockResolvedValue(result),
  };
  for (const m of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'match', 'order', 'limit', 'is', 'in', 'gt',
  ]) {
    chain[m] = jest.fn().mockReturnValue(chain);
  }
  return chain as Record<string, jest.Mock>;
}

function makeClient(...chains: ReturnType<typeof makeChain>[]) {
  let i = 0;
  return { from: jest.fn().mockImplementation(() => chains[i++]) } as unknown as SupabaseClient;
}

// ---- createPiece ----------------------------------------------------------------

describe('createPiece', () => {
  it('inserts a piece and initial sections', async () => {
    const piece = { id: PIECE_ID, author_id: AUTHOR_ID, title: 'My Piece', status: 'draft' };
    const supabase = makeClient(
      makeChain({ data: piece, error: null }),   // from('pieces').insert…single
      makeChain({ data: [], error: null })        // from('sections').insert
    );

    const result = await createPiece(supabase, AUTHOR_ID, {
      title: 'My Piece',
      sections: [{ content: 'Hello world' }],
    });

    expect(result.error).toBeNull();
    expect(result.data?.title).toBe('My Piece');
    expect(supabase.from).toHaveBeenCalledWith('pieces');
    expect(supabase.from).toHaveBeenCalledWith('sections');
  });

  it('returns DB_ERROR when insert fails', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'unique violation' } })
    );

    const result = await createPiece(supabase, AUTHOR_ID, { title: 'Bad' });

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('DB_ERROR');
  });

  it('skips sections insert when none provided', async () => {
    const piece = { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Empty', status: 'draft' };
    const supabase = makeClient(makeChain({ data: piece, error: null }));

    const result = await createPiece(supabase, AUTHOR_ID, { title: 'Empty' });

    expect(result.error).toBeNull();
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

// ---- updatePiece ----------------------------------------------------------------

describe('updatePiece', () => {
  it('updates piece when caller is the author', async () => {
    const updated = { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Updated', status: 'draft' };
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: updated, error: null })
    );

    const result = await updatePiece(supabase, PIECE_ID, AUTHOR_ID, { title: 'Updated' });

    expect(result.error).toBeNull();
    expect(result.data?.title).toBe('Updated');
  });

  it('returns FORBIDDEN when caller is not author', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null })
    );

    const result = await updatePiece(supabase, PIECE_ID, OTHER_ID, { title: 'Hack' });

    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when piece does not exist', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'not found' } })
    );

    const result = await updatePiece(supabase, 'no-such-id', AUTHOR_ID, { title: 'x' });

    expect(result.error?.code).toBe('NOT_FOUND');
  });
});

// ---- deletePiece ----------------------------------------------------------------

describe('deletePiece', () => {
  it('deletes piece when caller is the author', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: null, error: null })
    );

    const result = await deletePiece(supabase, PIECE_ID, AUTHOR_ID);

    expect(result.error).toBeNull();
    expect(result.data?.deleted).toBe(true);
  });

  it('returns FORBIDDEN when caller is not author', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null })
    );

    const result = await deletePiece(supabase, PIECE_ID, OTHER_ID);

    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when piece does not exist', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'not found' } })
    );

    const result = await deletePiece(supabase, 'no-such-id', AUTHOR_ID);

    expect(result.error?.code).toBe('NOT_FOUND');
  });
});

// ---- setStatus (publish / draft) ------------------------------------------------

describe('setStatus', () => {
  it('sets status to published', async () => {
    const updated = { id: PIECE_ID, author_id: AUTHOR_ID, title: 'T', status: 'published' };
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: updated, error: null })
    );

    const result = await setStatus(supabase, PIECE_ID, AUTHOR_ID, 'published');

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('published');
  });

  it('sets status back to draft', async () => {
    const updated = { id: PIECE_ID, author_id: AUTHOR_ID, title: 'T', status: 'draft' };
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null }),
      makeChain({ data: updated, error: null })
    );

    const result = await setStatus(supabase, PIECE_ID, AUTHOR_ID, 'draft');

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('draft');
  });

  it('returns FORBIDDEN for non-owner', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID }, error: null })
    );

    const result = await setStatus(supabase, PIECE_ID, OTHER_ID, 'published');

    expect(result.error?.code).toBe('FORBIDDEN');
  });
});

// ---- savePiece (versioned save) --------------------------------------------------

describe('savePiece', () => {
  function makeSaveClient(versionNumber: number) {
    return makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Story' }, error: null }),
      makeChain({ data: [], error: null }),                          // sections upsert
      makeChain({ data: null, error: null }),                        // sections delete (orphans)
      makeChain({ data: { version_number: versionNumber }, error: null }),  // piece_versions insert
      makeChain({ data: null, error: null })                         // pieces touch updated_at
    );
  }

  it('upserts sections and inserts a piece_version', async () => {
    const supabase = makeSaveClient(1);

    const result = await savePiece(supabase, PIECE_ID, AUTHOR_ID, [
      { ordinal: 1, title: 'Chapter 1', content: '# Hello' },
    ]);

    expect(result.error).toBeNull();
    expect(result.data?.version_number).toBe(1);
    expect(supabase.from).toHaveBeenCalledWith('sections');
    expect(supabase.from).toHaveBeenCalledWith('piece_versions');
  });

  it('each successive save returns an incremented version_number', async () => {
    const r1 = await savePiece(makeSaveClient(1), PIECE_ID, AUTHOR_ID, []);
    const r2 = await savePiece(makeSaveClient(2), PIECE_ID, AUTHOR_ID, []);

    expect(r1.data?.version_number).toBe(1);
    expect(r2.data?.version_number).toBe(2);
  });

  it('returns FORBIDDEN when non-owner tries to save', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Story' }, error: null })
    );

    const result = await savePiece(supabase, PIECE_ID, OTHER_ID, []);

    expect(result.error?.code).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when piece does not exist', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'not found' } })
    );

    const result = await savePiece(supabase, 'no-such-id', AUTHOR_ID, []);

    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('returns DB_ERROR when version insert fails', async () => {
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Story' }, error: null }),
      makeChain({ data: [], error: null }),
      makeChain({ data: null, error: null }),
      makeChain({ data: null, error: { message: 'db error' } })
    );

    const result = await savePiece(supabase, PIECE_ID, AUTHOR_ID, []);

    expect(result.error?.code).toBe('DB_ERROR');
  });

  it('deletes leftover section rows beyond the new section count', async () => {
    const sectionsChain = makeChain({ data: [], error: null });
    const supabase = makeClient(
      makeChain({ data: { id: PIECE_ID, author_id: AUTHOR_ID, title: 'Story' }, error: null }),
      sectionsChain,
      sectionsChain,
      makeChain({ data: { version_number: 2 }, error: null }),
      makeChain({ data: null, error: null })
    );

    await savePiece(supabase, PIECE_ID, AUTHOR_ID, [
      { ordinal: 1, title: 'Chapter 1', content: 'kept' },
    ]);

    expect(sectionsChain.delete).toHaveBeenCalled();
    expect(sectionsChain.eq).toHaveBeenCalledWith('piece_id', PIECE_ID);
    expect(sectionsChain.gt).toHaveBeenCalledWith('ordinal', 1);
  });
});

// ---- getPublicPiece (draft/publish authorization) --------------------------------

describe('getPublicPiece', () => {
  const piece = {
    id: PIECE_ID,
    author_id: AUTHOR_ID,
    title: 'Story',
    status: 'published',
    created_at: '',
    updated_at: '',
    sections: [],
  };

  it('returns published piece to any authenticated user', async () => {
    const supabase = makeClient(
      makeChain({ data: { ...piece, sections: [] }, error: null })
    );

    const result = await getPublicPiece(supabase, PIECE_ID, OTHER_ID);

    expect(result.error).toBeNull();
    expect(result.data?.id).toBe(PIECE_ID);
  });

  it('returns draft piece to its owner', async () => {
    const supabase = makeClient(
      makeChain({ data: { ...piece, status: 'draft', sections: [] }, error: null })
    );

    const result = await getPublicPiece(supabase, PIECE_ID, AUTHOR_ID);

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('draft');
  });

  it('returns NOT_FOUND for draft piece viewed by non-owner', async () => {
    const supabase = makeClient(
      makeChain({ data: { ...piece, status: 'draft', sections: [] }, error: null })
    );

    const result = await getPublicPiece(supabase, PIECE_ID, OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when piece does not exist', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: { message: 'not found' } })
    );

    const result = await getPublicPiece(supabase, 'no-such-id', OTHER_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('NOT_FOUND');
  });
});

// ---- countWords -----------------------------------------------------------------

describe('countWords', () => {
  it('counts plain words', () => {
    expect(countWords('hello world foo')).toBe(3);
  });

  it('strips markdown syntax before counting', () => {
    expect(countWords('# Heading\n\n**bold** and _italic_')).toBe(4);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('handles whitespace-only string', () => {
    expect(countWords('   \n  \t  ')).toBe(0);
  });
});

// ---- listAuthorPieces -----------------------------------------------------------

describe('listAuthorPieces', () => {
  it('returns pieces with computed section_count and word_count', async () => {
    const rows = [
      {
        id: PIECE_ID,
        author_id: AUTHOR_ID,
        title: 'Story',
        status: 'draft',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
        sections: [{ content: 'Hello world this is text' }],
      },
    ];
    const supabase = makeClient(makeChain({ data: rows, error: null }));

    const result = await listAuthorPieces(supabase, AUTHOR_ID);

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data![0].section_count).toBe(1);
    expect(result.data![0].word_count).toBe(5);
    expect(result.data![0].title).toBe('Story');
  });

  it('returns empty array when author has no pieces', async () => {
    const supabase = makeClient(makeChain({ data: [], error: null }));

    const result = await listAuthorPieces(supabase, AUTHOR_ID);

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(0);
  });

  it('handles pieces with no sections', async () => {
    const rows = [
      {
        id: PIECE_ID,
        author_id: AUTHOR_ID,
        title: 'Empty',
        status: 'draft',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        sections: [],
      },
    ];
    const supabase = makeClient(makeChain({ data: rows, error: null }));

    const result = await listAuthorPieces(supabase, AUTHOR_ID);

    expect(result.data![0].section_count).toBe(0);
    expect(result.data![0].word_count).toBe(0);
  });

  it('aggregates word counts across multiple sections', async () => {
    const rows = [
      {
        id: PIECE_ID,
        author_id: AUTHOR_ID,
        title: 'Multi',
        status: 'published',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        sections: [
          { content: 'one two three' },
          { content: 'four five' },
        ],
      },
    ];
    const supabase = makeClient(makeChain({ data: rows, error: null }));

    const result = await listAuthorPieces(supabase, AUTHOR_ID);

    expect(result.data![0].section_count).toBe(2);
    expect(result.data![0].word_count).toBe(5);
  });

  it('returns DB_ERROR on query failure', async () => {
    const supabase = makeClient(makeChain({ data: null, error: { message: 'connection failed' } }));

    const result = await listAuthorPieces(supabase, AUTHOR_ID);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('DB_ERROR');
  });
});
