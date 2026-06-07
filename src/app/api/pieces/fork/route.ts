import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { forkPiece } from '@/lib/pieces';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { piece_id, section_id } = body as { piece_id?: string; section_id?: string };

  if (!piece_id || !section_id) {
    return NextResponse.json({ error: 'piece_id and section_id required' }, { status: 400 });
  }

  const result = await forkPiece(supabase, piece_id, section_id, user.id);

  if (result.error) {
    const status =
      result.error.code === 'BAD_REQUEST'
        ? 400
        : result.error.code === 'FORBIDDEN'
        ? 403
        : result.error.code === 'NOT_FOUND'
        ? 404
        : 500;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json(result.data, { status: 201 });
}
