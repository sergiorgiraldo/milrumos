import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { marked } from 'marked';
import type { Section, PieceMetadata, Profile } from '@/lib/schema';
import { canFork } from '@/lib/fork';
import ForkPanel from '@/components/ForkPanel';
import LineageBanner from '@/components/LineageBanner';
import NavBar from '@/components/NavBar';
import { getLineage } from '@/lib/lineage';

type Props = { params: Promise<{ id: string }> };

export default async function PieceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: piece } = await supabase
    .from('pieces')
    .select('*, sections(*)')
    .eq('id', id)
    .single();

  if (!piece) notFound();

  const p = piece as typeof piece & { sections?: Section[] };

  if (p.status === 'draft' && p.author_id !== user.id) notFound();

  const [{ data: metadata }, { data: authorProfile }, lineage] = await Promise.all([
    supabase
      .from('piece_metadata')
      .select('genre, tags, idea_summary')
      .eq('piece_id', id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('display_name, username, avatar_url')
      .eq('id', p.author_id)
      .single(),
    getLineage(supabase, id),
  ]);

  const meta = metadata as Pick<PieceMetadata, 'genre' | 'tags' | 'idea_summary'> | null;
  const author = authorProfile as Pick<Profile, 'display_name' | 'username' | 'avatar_url'> | null;
  const authorName = author?.display_name ?? author?.username ?? 'Unknown Author';

  const sortedSections = [...(p.sections ?? [])].sort(
    (a: Section, b: Section) => a.ordinal - b.ordinal
  );

  const renderedSections = await Promise.all(
    sortedSections.map(async (s: Section) => ({
      id: s.id,
      title: s.title,
      html: await marked.parse(s.content ?? ''),
    }))
  );

  const publishDate = p.updated_at
    ? new Date(p.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isOwner = p.author_id === user.id;
  const forkEnabled = canFork(p.status as 'draft' | 'published', isOwner);

  return (
    <div className="min-h-screen bg-pale-slate-50">
      <NavBar
        rightContent={
          isOwner ? (
            <a
              href={`/pieces/${id}/edit`}
              className="px-4 py-1.5 rounded-lg bg-pale-slate-100 text-pale-slate-700 text-sm font-medium hover:bg-pale-slate-200 transition-colors"
            >
              Edit
            </a>
          ) : undefined
        }
      />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <LineageBanner lineage={lineage} />

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                p.status === 'published'
                  ? 'bg-air-force-blue-100 text-air-force-blue-700'
                  : 'bg-pale-slate-200 text-pale-slate-500'
              }`}
            >
              {p.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-pale-slate-900 mb-4">{p.title}</h1>

          <div className="flex items-center gap-3 text-sm text-pale-slate-500">
            {author?.avatar_url && (
              <img
                src={author.avatar_url}
                alt={authorName}
                className="w-7 h-7 rounded-full border border-pale-slate-200"
              />
            )}
            <span className="font-medium text-pale-slate-700">{authorName}</span>
            {publishDate && <span>· {publishDate}</span>}
          </div>

          {(meta?.genre || (meta?.tags && meta.tags.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {meta?.genre && (
                <span className="px-3 py-1 rounded-full bg-ruby-red-100 text-ruby-red-700 text-xs font-medium">
                  {meta.genre}
                </span>
              )}
              {meta?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-sky-blue-100 text-sky-blue-700 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={`/pieces/${id}/tree`}
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-air-force-blue-600 hover:text-air-force-blue-800"
          >
            <span aria-hidden="true">⤷</span> View branch tree
          </a>

          {meta?.idea_summary && (
            <p className="mt-4 text-sm text-pale-slate-600 leading-relaxed border-l-2 border-pale-slate-300 pl-3 italic">
              {meta.idea_summary}
            </p>
          )}
        </header>

        {/* Sections */}
        <ForkPanel
          sections={renderedSections}
          pieceId={id}
          showForkButtons={forkEnabled}
        />
      </main>
    </div>
  );
}
