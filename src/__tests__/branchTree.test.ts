import { findRootId, assembleBranchTree, type LineageEdge, type PieceNodeInfo } from '@/lib/branchTree';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import BranchTree from '@/components/BranchTree';

// ---- findRootId -------------------------------------------------------------------

describe('findRootId', () => {
  it('returns the piece itself when it has no parent', () => {
    const edges: LineageEdge[] = [{ pieceId: 'b', parentPieceId: 'a', forkSectionId: null }];
    expect(findRootId(edges, 'a')).toBe('a');
  });

  it('walks up the chain to find the topmost ancestor', () => {
    const edges: LineageEdge[] = [
      { pieceId: 'c', parentPieceId: 'b', forkSectionId: null },
      { pieceId: 'b', parentPieceId: 'a', forkSectionId: null },
    ];
    expect(findRootId(edges, 'c')).toBe('a');
  });

  it('does not loop forever on cyclic data', () => {
    const edges: LineageEdge[] = [
      { pieceId: 'a', parentPieceId: 'b', forkSectionId: null },
      { pieceId: 'b', parentPieceId: 'a', forkSectionId: null },
    ];
    expect(() => findRootId(edges, 'a')).not.toThrow();
  });
});

// ---- assembleBranchTree ------------------------------------------------------------

const piece = (id: string, title: string, status: 'draft' | 'published' = 'published'): PieceNodeInfo => ({
  id,
  title,
  authorName: `Author of ${title}`,
  status,
});

describe('assembleBranchTree', () => {
  it('builds a single-node tree for a piece with no forks', () => {
    const pieces = new Map([['root', piece('root', 'Original Story')]]);
    const tree = assembleBranchTree('root', [], pieces, new Map());

    expect(tree.id).toBe('root');
    expect(tree.title).toBe('Original Story');
    expect(tree.isPlaceholder).toBe(false);
    expect(tree.children).toHaveLength(0);
  });

  it('nests direct and transitive forks as children', () => {
    const edges: LineageEdge[] = [
      { pieceId: 'fork-1', parentPieceId: 'root', forkSectionId: 'sec-1' },
      { pieceId: 'fork-2', parentPieceId: 'fork-1', forkSectionId: 'sec-2' },
    ];
    const pieces = new Map([
      ['root', piece('root', 'Original Story')],
      ['fork-1', piece('fork-1', 'Fork One')],
      ['fork-2', piece('fork-2', 'Fork Two')],
    ]);
    const sectionTitles = new Map([
      ['sec-1', 'Chapter One'],
      ['sec-2', 'Chapter Two'],
    ]);

    const tree = assembleBranchTree('root', edges, pieces, sectionTitles);

    expect(tree.children).toHaveLength(1);
    const forkOne = tree.children[0];
    expect(forkOne.id).toBe('fork-1');
    expect(forkOne.forkSectionTitle).toBe('Chapter One');
    expect(forkOne.children).toHaveLength(1);

    const forkTwo = forkOne.children[0];
    expect(forkTwo.id).toBe('fork-2');
    expect(forkTwo.forkSectionTitle).toBe('Chapter Two');
  });

  it('shows multiple sibling forks of the same piece', () => {
    const edges: LineageEdge[] = [
      { pieceId: 'fork-a', parentPieceId: 'root', forkSectionId: null },
      { pieceId: 'fork-b', parentPieceId: 'root', forkSectionId: null },
    ];
    const pieces = new Map([
      ['root', piece('root', 'Original Story')],
      ['fork-a', piece('fork-a', 'Fork A')],
      ['fork-b', piece('fork-b', 'Fork B')],
    ]);

    const tree = assembleBranchTree('root', edges, pieces, new Map());
    expect(tree.children.map((c) => c.id).sort()).toEqual(['fork-a', 'fork-b']);
  });

  it('represents a missing piece as a placeholder node, keeping its descendants attached', () => {
    const edges: LineageEdge[] = [
      { pieceId: 'deleted', parentPieceId: 'root', forkSectionId: null },
      { pieceId: 'fork-of-deleted', parentPieceId: 'deleted', forkSectionId: null },
    ];
    const pieces = new Map([
      ['root', piece('root', 'Original Story')],
      ['fork-of-deleted', piece('fork-of-deleted', 'Surviving Fork')],
    ]);

    const tree = assembleBranchTree('root', edges, pieces, new Map());
    const placeholder = tree.children[0];

    expect(placeholder.isPlaceholder).toBe(true);
    expect(placeholder.id).toBe('deleted');
    expect(placeholder.children).toHaveLength(1);
    expect(placeholder.children[0].id).toBe('fork-of-deleted');
    expect(placeholder.children[0].isPlaceholder).toBe(false);
  });

  it('falls back to null fork section title when the section id is unknown', () => {
    const edges: LineageEdge[] = [{ pieceId: 'fork-1', parentPieceId: 'root', forkSectionId: 'missing-sec' }];
    const pieces = new Map([
      ['root', piece('root', 'Original Story')],
      ['fork-1', piece('fork-1', 'Fork One')],
    ]);

    const tree = assembleBranchTree('root', edges, pieces, new Map());
    expect(tree.children[0].forkSectionTitle).toBeNull();
  });
});

// ---- BranchTree rendering -----------------------------------------------------------

describe('BranchTree', () => {
  it('renders nodes, edge labels, and links to piece detail pages', () => {
    const root = assembleBranchTree(
      'root',
      [{ pieceId: 'fork-1', parentPieceId: 'root', forkSectionId: 'sec-1' }],
      new Map([
        ['root', piece('root', 'Original Story')],
        ['fork-1', piece('fork-1', 'Fork One')],
      ]),
      new Map([['sec-1', 'Chapter One']])
    );

    const html = renderToStaticMarkup(React.createElement(BranchTree, { root, currentPieceId: 'fork-1' }));

    expect(html).toContain('Original Story');
    expect(html).toContain('Fork One');
    expect(html).toContain('Chapter One');
    expect(html).toContain('href="/pieces/root"');
    expect(html).toContain('href="/pieces/fork-1"');
  });

  it('highlights the current piece node', () => {
    const root = assembleBranchTree(
      'root',
      [{ pieceId: 'fork-1', parentPieceId: 'root', forkSectionId: null }],
      new Map([
        ['root', piece('root', 'Original Story')],
        ['fork-1', piece('fork-1', 'Fork One')],
      ]),
      new Map()
    );

    const html = renderToStaticMarkup(React.createElement(BranchTree, { root, currentPieceId: 'fork-1' }));
    expect(html).toContain('ring-ruby-red-200');
  });

  it('renders placeholder nodes without a link', () => {
    const root = assembleBranchTree(
      'root',
      [{ pieceId: 'deleted', parentPieceId: 'root', forkSectionId: null }],
      new Map([['root', piece('root', 'Original Story')]]),
      new Map()
    );

    const html = renderToStaticMarkup(React.createElement(BranchTree, { root, currentPieceId: 'root' }));
    expect(html).toContain('Deleted piece');
    expect(html).toContain('No longer available');
    expect(html).not.toContain('href="/pieces/deleted"');
  });
});
