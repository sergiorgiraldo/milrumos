import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setStatus } from '@/lib/pieces';
import type { PieceStatus } from '@/lib/schema';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = await setStatus(supabase, id, user.id, body.status as PieceStatus);

  if (result.error) {
    const status = result.error.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result.data);
}
