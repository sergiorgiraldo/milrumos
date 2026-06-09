import type { SupabaseClient } from '@supabase/supabase-js';
import type { PieceStatus } from './schema';

export interface LineageEdge {
  pieceId: string;
  parentPieceId: string;
  forkSectionId: string | null;
}

export interface PieceNodeInfo {
  id: string;
  title: string;
  authorName: string;
  status: PieceStatus;
}

export interface BranchTreeNode {
  id: string;
  title: string;
  authorName: string;
  status: PieceStatus | null;
  forkSectionTitle: string | null;
  isPlaceholder: boolean;
  children: BranchTreeNode[];
}

/**
 * Walks parent links starting from pieceId and returns the id of the
 * topmost ancestor (the piece with no recorded parent).
 */
export function findRootId(edges: LineageEdge[], pieceId: string): string {
  const parentOf = new Map(edges.map((e) => [e.pieceId, e.parentPieceId]));
  let current = pieceId;
  const seen = new Set<string>();
  while (parentOf.has(current) && !seen.has(current)) {
    seen.add(current);
    current = parentOf.get(current)!;
  }
  return current;
}

/**
 * Pure assembly of a branch tree from raw lineage edges and piece info.
 * Pieces missing from `pieces` (deleted/orphaned) become placeholder nodes,
 * but their recorded descendants are still attached beneath them.
 */
export function assembleBranchTree(
  rootId: string,
  edges: LineageEdge[],
  pieces: Map<string, PieceNodeInfo>,
  sectionTitles: Map<string, string | null>
): BranchTreeNode {
  const childrenOf = new Map<string, LineageEdge[]>();
  for (const edge of edges) {
    const list = childrenOf.get(edge.parentPieceId);
    if (list) list.push(edge);
    else childrenOf.set(edge.parentPieceId, [edge]);
  }

  function buildNode(id: string, forkSectionId: string | null): BranchTreeNode {
    const info = pieces.get(id);
    const children = (childrenOf.get(id) ?? []).map((edge) => buildNode(edge.pieceId, edge.forkSectionId));
    const forkSectionTitle = forkSectionId ? sectionTitles.get(forkSectionId) ?? null : null;

    if (!info) {
      return {
        id,
        title: 'Deleted piece',
        authorName: '',
        status: null,
        forkSectionTitle,
        isPlaceholder: true,
        children,
      };
    }

    return {
      id,
      title: info.title,
      authorName: info.authorName,
      status: info.status,
      forkSectionTitle,
      isPlaceholder: false,
      children,
    };
  }

  return buildNode(rootId, null);
}

function collectDescendantIds(rootId: string, edges: LineageEdge[]): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const edge of edges) {
    const list = childrenOf.get(edge.parentPieceId);
    if (list) list.push(edge.pieceId);
    else childrenOf.set(edge.parentPieceId, [edge.pieceId]);
  }

  const ids = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const childId of childrenOf.get(current) ?? []) {
      if (!ids.has(childId)) {
        ids.add(childId);
        queue.push(childId);
      }
    }
  }
  return ids;
}

export async function getBranchTree(
  supabase: SupabaseClient,
  pieceId: string
): Promise<BranchTreeNode | null> {
  const { data: lineageRows } = await supabase
    .from('piece_lineage')
    .select('piece_id, parent_piece_id, fork_section_id');

  const edges: LineageEdge[] = ((lineageRows ?? []) as Array<{
    piece_id: string;
    parent_piece_id: string;
    fork_section_id: string | null;
  }>).map((r) => ({ pieceId: r.piece_id, parentPieceId: r.parent_piece_id, forkSectionId: r.fork_section_id }));

  const rootId = findRootId(edges, pieceId);
  const relevantIds = Array.from(collectDescendantIds(rootId, edges));

  const { data: pieceRows } = await supabase
    .from('pieces')
    .select('id, title, author_id, status')
    .in('id', relevantIds);

  const rows = (pieceRows ?? []) as Array<{ id: string; title: string; author_id: string; status: PieceStatus }>;
  if (rows.length === 0) return null;

  const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .in('id', authorIds);

  const profiles = new Map(
    ((profileRows ?? []) as Array<{ id: string; display_name: string | null; username: string }>).map((p) => [
      p.id,
      p.display_name ?? p.username ?? 'Unknown',
    ])
  );

  const pieces = new Map<string, PieceNodeInfo>(
    rows.map((r) => [
      r.id,
      { id: r.id, title: r.title, authorName: profiles.get(r.author_id) ?? 'Unknown', status: r.status },
    ])
  );

  const sectionIds = Array.from(new Set(edges.map((e) => e.forkSectionId).filter((id): id is string => !!id)));
  let sectionTitles = new Map<string, string | null>();
  if (sectionIds.length > 0) {
    const { data: sectionRows } = await supabase.from('sections').select('id, title').in('id', sectionIds);
    sectionTitles = new Map(
      ((sectionRows ?? []) as Array<{ id: string; title: string | null }>).map((s) => [s.id, s.title])
    );
  }

  const relevantEdges = edges.filter((e) => pieces.has(e.pieceId) || pieces.has(e.parentPieceId));

  return assembleBranchTree(rootId, relevantEdges, pieces, sectionTitles);
}
