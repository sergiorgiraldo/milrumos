import { getLineage } from '@/lib/lineage';
import type { SupabaseClient } from '@supabase/supabase-js';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import LineageBanner from '@/components/LineageBanner';

// ---- supabase mock helpers ---------------------------------------------------

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

// ---- getLineage --------------------------------------------------------------

describe('getLineage', () => {
  it('returns null when no lineage row exists', async () => {
    const supabase = makeClient(
      makeChain({ data: null, error: null }) // piece_lineage maybySingle → no row
    );

    const result = await getLineage(supabase, 'piece-1');
    expect(result).toBeNull();
  });

  it('returns lineage info when row exists', async () => {
    const supabase = makeClient(
      makeChain({ data: { parent_piece_id: 'parent-1', fork_section_id: 'sec-1' }, error: null }),
      makeChain({ data: { id: 'parent-1', title: 'Original Story', author_id: 'auth-1' }, error: null }),
      makeChain({ data: { title: 'Chapter One' }, error: null }),
      makeChain({ data: { display_name: 'Jane Doe', username: 'janedoe' }, error: null }),
    );

    const result = await getLineage(supabase, 'piece-2');
    expect(result).not.toBeNull();
    expect(result?.parentPieceId).toBe('parent-1');
    expect(result?.parentPieceTitle).toBe('Original Story');
    expect(result?.parentAuthorName).toBe('Jane Doe');
    expect(result?.forkSectionTitle).toBe('Chapter One');
  });

  it('falls back to username when display_name is null', async () => {
    const supabase = makeClient(
      makeChain({ data: { parent_piece_id: 'parent-1', fork_section_id: 'sec-1' }, error: null }),
      makeChain({ data: { id: 'parent-1', title: 'Story', author_id: 'auth-1' }, error: null }),
      makeChain({ data: { title: null }, error: null }),
      makeChain({ data: { display_name: null, username: 'janedoe' }, error: null }),
    );

    const result = await getLineage(supabase, 'piece-2');
    expect(result?.parentAuthorName).toBe('janedoe');
    expect(result?.forkSectionTitle).toBeNull();
  });

  it('returns null when parent piece is not found', async () => {
    const supabase = makeClient(
      makeChain({ data: { parent_piece_id: 'parent-1', fork_section_id: 'sec-1' }, error: null }),
      makeChain({ data: null, error: { message: 'not found' } }),
      makeChain({ data: null, error: null }),
    );

    const result = await getLineage(supabase, 'piece-2');
    expect(result).toBeNull();
  });
});

// ---- LineageBanner rendering -------------------------------------------------

describe('LineageBanner', () => {
  it('renders nothing when lineage is null (lineage-absent)', () => {
    const html = renderToStaticMarkup(React.createElement(LineageBanner, { lineage: null }));
    expect(html).toBe('');
  });

  it('renders banner with title, author, and section when lineage is present (lineage-present)', () => {
    const lineage = {
      parentPieceId: 'parent-1',
      parentPieceTitle: 'Original Story',
      parentAuthorName: 'Jane Doe',
      forkSectionTitle: 'Chapter One',
    };
    const html = renderToStaticMarkup(React.createElement(LineageBanner, { lineage }));
    expect(html).toContain('Forked from');
    expect(html).toContain('Original Story');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Chapter One');
    expect(html).toContain('href="/pieces/parent-1"');
  });

  it('renders banner without section label when forkSectionTitle is null', () => {
    const lineage = {
      parentPieceId: 'parent-1',
      parentPieceTitle: 'Original Story',
      parentAuthorName: 'Jane Doe',
      forkSectionTitle: null,
    };
    const html = renderToStaticMarkup(React.createElement(LineageBanner, { lineage }));
    expect(html).toContain('Forked from');
    expect(html).not.toContain('starting from');
  });
});
