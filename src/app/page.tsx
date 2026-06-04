import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { listAuthorPieces } from '@/lib/pieces';
import LogoutButton from './LogoutButton';
import NewPieceButton from '@/components/NewPieceButton';
import DashboardTable from '@/components/DashboardTable';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profile }, { data: pieces }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, avatar_url, username')
      .eq('id', user.id)
      .single(),
    listAuthorPieces(supabase, user.id),
  ]);

  const displayName = profile?.display_name ?? profile?.username ?? user.email;

  return (
    <div className="min-h-screen bg-pale-slate-50">
      <header className="bg-white border-b border-pale-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ruby-red-600">Milrumos</h1>
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={displayName ?? ''}
                className="w-8 h-8 rounded-full border border-pale-slate-200"
              />
            )}
            <span className="text-pale-slate-700 text-sm font-medium">{displayName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-pale-slate-800">My Pieces</h2>
          <NewPieceButton />
        </div>

        {!pieces?.length ? (
          <div className="text-center py-20 bg-white rounded-xl border border-pale-slate-200 shadow-sm">
            <p className="text-pale-slate-600 text-lg font-medium mb-2">No pieces yet.</p>
            <p className="text-pale-slate-400 text-sm mb-8">
              Start writing. Branch from anything. Build together.
            </p>
            <div className="flex justify-center">
              <NewPieceButton />
            </div>
          </div>
        ) : (
          <DashboardTable pieces={pieces} />
        )}
      </main>
    </div>
  );
}
