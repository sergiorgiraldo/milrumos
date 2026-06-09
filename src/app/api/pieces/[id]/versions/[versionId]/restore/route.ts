import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { restoreVersion } from '@/lib/versions';

type Params = { params: Promise<{ id: string; versionId: string }> };

function statusFor(code: string) {
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  return 400;
}

export async function POST(_: Request, { params }: Params) {
  const { id, versionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await restoreVersion(supabase, id, versionId, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: statusFor(result.error.code) });
  }

  return NextResponse.json(result.data);
}
