import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPiece, updatePiece, deletePiece } from '@/lib/pieces';

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

  const result = await getPiece(supabase, id);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 404 });
  return NextResponse.json(result.data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const result = await updatePiece(supabase, id, user.id, body);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: statusFor(result.error.code) });
  }

  return NextResponse.json(result.data);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await deletePiece(supabase, id, user.id);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: statusFor(result.error.code) });
  }

  return NextResponse.json(result.data);
}
