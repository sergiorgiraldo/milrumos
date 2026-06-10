import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import PieceEditor from '@/components/PieceEditor';
import type { SectionData } from '@/lib/editor';
import type { Section } from '@/lib/schema';

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: piece, error }, { data: profile }] = await Promise.all([
    supabase
      .from('pieces')
      .select('*, sections(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('profiles')
      .select('display_name, avatar_url, username')
      .eq('id', user.id)
      .single(),
  ]);

  if (error || !piece) notFound();

  const p = piece as typeof piece & { sections?: Section[] };
  if (p.author_id !== user.id) redirect(`/pieces/${id}`);

  const sections: SectionData[] = [...(p.sections ?? [])]
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((s) => ({
      id: s.id,
      ordinal: s.ordinal,
      title: s.title,
      content: s.content,
    }));

  let inheritedCount = 0;
  const { data: lineage } = await supabase
    .from('piece_lineage')
    .select('fork_section_id')
    .eq('piece_id', id)
    .maybeSingle();

  if (lineage?.fork_section_id) {
    const { data: forkSec } = await supabase
      .from('sections')
      .select('ordinal')
      .eq('id', lineage.fork_section_id)
      .single();
    if (forkSec) {
      inheritedCount = (forkSec as { ordinal: number }).ordinal;
    }
  }

  const { data: metadataRow } = await supabase
    .from('piece_metadata')
    .select('genre, tags, idea_summary')
    .eq('piece_id', id)
    .maybeSingle();

  const initialMetadata = metadataRow
    ? {
        genre: (metadataRow as { genre: string | null }).genre ?? null,
        tags: (metadataRow as { tags: string[] }).tags ?? [],
        idea_summary: (metadataRow as { idea_summary: string | null }).idea_summary ?? null,
      }
    : { genre: null, tags: [], idea_summary: null };

  const userDisplayName = profile?.display_name ?? profile?.username ?? user.email ?? '';

  return (
    <PieceEditor
      pieceId={id}
      initialTitle={p.title}
      initialSections={sections}
      initialStatus={p.status}
      inheritedCount={inheritedCount}
      initialMetadata={initialMetadata}
      userDisplayName={userDisplayName}
      userAvatarUrl={profile?.avatar_url}
    />
  );
}
