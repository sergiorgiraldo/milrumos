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

  const { data: piece, error } = await supabase
    .from('pieces')
    .select('*, sections(*)')
    .eq('id', id)
    .single();

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

  return (
    <PieceEditor
      pieceId={id}
      initialTitle={p.title}
      initialSections={sections}
      initialStatus={p.status}
    />
  );
}
