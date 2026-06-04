import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { savePiece } from '@/lib/pieces';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = await savePiece(supabase, id, user.id, body.sections ?? []);

  if (result.error) {
    const status = result.error.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result.data);
}
