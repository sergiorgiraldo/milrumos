'use client';

import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslation();

  async function handleLogout() {
    const supabase = createClient();
    await signOut(supabase);
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-pale-slate-500 hover:text-ruby-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-ruby-red-50"
    >
      {t('auth.signOut')}
    </button>
  );
}
