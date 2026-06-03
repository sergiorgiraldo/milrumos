import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPiece } from '@/lib/pieces';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = await createPiece(supabase, user.id, body);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json(result.data, { status: 201 });
}
