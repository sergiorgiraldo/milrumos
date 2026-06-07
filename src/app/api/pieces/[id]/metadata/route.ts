import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GENRES } from '@/lib/schema';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: piece } = await supabase
    .from('pieces')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!piece) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((piece as { author_id: string }).author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const genre: string | null = GENRES.includes(body.genre) ? body.genre : null;
  const tags: string[] = Array.isArray(body.tags)
    ? body.tags.filter((t: unknown) => typeof t === 'string' && t.trim()).map((t: string) => t.trim())
    : [];
  const idea_summary: string | null =
    typeof body.idea_summary === 'string' ? body.idea_summary || null : null;

  const { error } = await supabase.from('piece_metadata').upsert(
    { piece_id: id, genre, tags, idea_summary, updated_at: new Date().toISOString() },
    { onConflict: 'piece_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
