import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchPieces } from '@/lib/search';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const genre = searchParams.get('genre') ?? null;

  const result = await searchPieces(supabase, q, genre);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ results: result.data });
}
