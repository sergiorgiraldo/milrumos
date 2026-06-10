import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import NavBar from '@/components/NavBar';
import UserMenu from '@/components/UserMenu';
import BranchTree from '@/components/BranchTree';
import { getBranchTree } from '@/lib/branchTree';
import { getServerT } from '@/lib/i18n';

type Props = { params: Promise<{ id: string }> };

export default async function BranchTreePage({ params }: Props) {
  const { id } = await params;
  const [supabase, { t }] = await Promise.all([createClient(), getServerT()]);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: piece }, { data: profile }] = await Promise.all([
    supabase
      .from('pieces')
      .select('id, title, author_id, status')
      .eq('id', id)
      .single(),
    supabase
      .from('profiles')
      .select('display_name, avatar_url, username')
      .eq('id', user.id)
      .single(),
  ]);

  if (!piece) notFound();
  const p = piece as { id: string; title: string; author_id: string; status: 'draft' | 'published' };
  if (p.status === 'draft' && p.author_id !== user.id) notFound();

  const displayName = profile?.display_name ?? profile?.username ?? user.email;
  const tree = await getBranchTree(supabase, id);

  return (
    <div className="min-h-screen bg-pale-slate-50">
      <NavBar
        rightContent={<UserMenu displayName={displayName ?? ''} avatarUrl={profile?.avatar_url} />}
      />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <a
            href={`/pieces/${id}`}
            className="text-sm text-air-force-blue-600 hover:text-air-force-blue-800 font-medium"
          >
            {t('branchTree.backTo', { title: p.title })}
          </a>
          <h1 className="text-2xl font-bold text-pale-slate-900 mt-2">{t('branchTree.title')}</h1>
          <p className="text-sm text-pale-slate-500 mt-1">
            {t('branchTree.subtitle')}
          </p>
        </div>

        {tree ? (
          <div className="bg-white rounded-xl border border-pale-slate-200 p-6">
            <BranchTree root={tree} currentPieceId={id} />
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-pale-slate-200">
            <p className="text-pale-slate-500 font-medium">{t('branchTree.noLineage')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
