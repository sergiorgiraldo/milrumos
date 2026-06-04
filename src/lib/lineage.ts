import type { SupabaseClient } from '@supabase/supabase-js';

export interface LineageInfo {
  parentPieceId: string;
  parentPieceTitle: string;
  parentAuthorName: string;
  forkSectionTitle: string | null;
}

export async function getLineage(
  supabase: SupabaseClient,
  pieceId: string
): Promise<LineageInfo | null> {
  const { data: lineage } = await supabase
    .from('piece_lineage')
    .select('parent_piece_id, fork_section_id')
    .eq('piece_id', pieceId)
    .maybeSingle();

  if (!lineage) return null;

  const [{ data: parent }, { data: forkSection }] = await Promise.all([
    supabase
      .from('pieces')
      .select('id, title, author_id')
      .eq('id', lineage.parent_piece_id)
      .single(),
    lineage.fork_section_id
      ? supabase
          .from('sections')
          .select('title')
          .eq('id', lineage.fork_section_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  if (!parent) return null;

  const { data: authorProfile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', (parent as { author_id: string }).author_id)
    .single();

  const p = parent as { id: string; title: string };
  const profile = authorProfile as { display_name: string | null; username: string } | null;
  const section = forkSection as { title: string | null } | null;

  return {
    parentPieceId: p.id,
    parentPieceTitle: p.title,
    parentAuthorName: profile?.display_name ?? profile?.username ?? 'Unknown',
    forkSectionTitle: section?.title ?? null,
  };
}
