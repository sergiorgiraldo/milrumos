import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listVersions } from '@/lib/versions';

type Params = { params: Promise<{ id: string }> };

function statusFor(code: string) {
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  return 400;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await listVersions(supabase, id, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: statusFor(result.error.code) });
  }

  return NextResponse.json({ versions: result.data });
}
