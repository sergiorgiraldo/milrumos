import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import NewPieceButton from '@/components/NewPieceButton';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, username')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name ?? profile?.username ?? user.email;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pale-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg w-full text-center">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-ruby-red-600">Milrumos</h1>
          <LogoutButton />
        </div>

        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={displayName ?? ''}
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-pale-slate-200"
          />
        )}

        <p className="text-pale-slate-700 text-lg mb-2">
          Welcome, <span className="font-semibold text-air-force-blue-600">{displayName}</span>
        </p>
        <p className="text-pale-slate-500 text-sm mb-8">
          Collaborative writing. Branch from any point. Build on each other.
        </p>

        <div className="flex justify-center mb-6">
          <NewPieceButton />
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <span className="px-4 py-2 rounded-full bg-ruby-red-100 text-ruby-red-700 text-sm font-medium">
            Write
          </span>
          <span className="px-4 py-2 rounded-full bg-air-force-blue-100 text-air-force-blue-700 text-sm font-medium">
            Branch
          </span>
          <span className="px-4 py-2 rounded-full bg-sky-blue-100 text-sky-blue-700 text-sm font-medium">
            Collaborate
          </span>
        </div>
      </div>
    </main>
  );
}
