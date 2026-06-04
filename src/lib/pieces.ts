import type { SupabaseClient } from '@supabase/supabase-js';
import type { Piece, Section, PieceStatus } from './schema';

export type PieceSummary = Piece & { section_count: number; word_count: number };

export function countWords(text: string): number {
  return text.replace(/[#*_`~[\]()>=-]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

export type PieceError = { code: 'NOT_FOUND' | 'FORBIDDEN' | 'DB_ERROR'; message: string };
export type PieceResult<T> = { data: T; error: null } | { data: null; error: PieceError };

function buildSnapshot(
  title: string,
  sections: Array<{ ordinal: number; title?: string | null; content: string }>
): string {
  const sorted = [...sections].sort((a, b) => a.ordinal - b.ordinal);
  const parts: string[] = [`# ${title}`];
  for (const s of sorted) {
    if (s.title) parts.push(`## ${s.title}`);
    if (s.content) parts.push(s.content);
  }
  return parts.join('\n\n');
}

export async function createPiece(
  supabase: SupabaseClient,
  authorId: string,
  input: { title: string; sections?: Array<{ title?: string | null; content: string }> }
): Promise<PieceResult<Piece>> {
  const { data: piece, error } = await supabase
    .from('pieces')
    .insert({ title: input.title, author_id: authorId, status: 'draft' })
    .select()
    .single();

  if (error || !piece) {
    return { data: null, error: { code: 'DB_ERROR', message: error?.message ?? 'insert failed' } };
  }

  const sections = input.sections ?? [];
  if (sections.length > 0) {
    await supabase.from('sections').insert(
      sections.map((s, i) => ({
        piece_id: (piece as Piece).id,
        ordinal: i + 1,
        title: s.title ?? null,
        content: s.content,
      }))
    );
  }

  return { data: piece as Piece, error: null };
}

export async function getPiece(
  supabase: SupabaseClient,
  pieceId: string
): Promise<PieceResult<Piece & { sections: Section[] }>> {
  const { data, error } = await supabase
    .from('pieces')
    .select('*, sections(*)')
    .eq('id', pieceId)
    .single();

  if (error || !data) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'piece not found' } };
  }

  const d = data as Piece & { sections?: Section[] };
  return { data: { ...d, sections: d.sections ?? [] }, error: null };
}

export async function updatePiece(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string,
  updates: Partial<Pick<Piece, 'title' | 'status'>>
): Promise<PieceResult<Piece>> {
  const { data: existing } = await supabase
    .from('pieces')
    .select('id, author_id')
    .eq('id', pieceId)
    .single();

  if (!existing) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'piece not found' } };
  }
  if ((existing as { author_id: string }).author_id !== authorId) {
    return { data: null, error: { code: 'FORBIDDEN', message: 'not your piece' } };
  }

  const { data: updated, error } = await supabase
    .from('pieces')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', pieceId)
    .select()
    .single();

  if (error || !updated) {
    return { data: null, error: { code: 'DB_ERROR', message: error?.message ?? 'update failed' } };
  }

  return { data: updated as Piece, error: null };
}

export async function savePiece(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string,
  sections: Array<{ ordinal: number; title?: string | null; content: string }>
): Promise<PieceResult<{ version_number: number }>> {
  const { data: piece } = await supabase
    .from('pieces')
    .select('id, author_id, title')
    .eq('id', pieceId)
    .single();

  if (!piece) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'piece not found' } };
  }
  if ((piece as { author_id: string }).author_id !== authorId) {
    return { data: null, error: { code: 'FORBIDDEN', message: 'not your piece' } };
  }

  await supabase.from('sections').upsert(
    sections.map((s) => ({
      piece_id: pieceId,
      ordinal: s.ordinal,
      title: s.title ?? null,
      content: s.content,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'piece_id,ordinal' }
  );

  const snapshot = buildSnapshot((piece as { title: string }).title, sections);

  const { data: version, error: vErr } = await supabase
    .from('piece_versions')
    .insert({
      piece_id: pieceId,
      markdown_snapshot: snapshot,
      author_id: authorId,
      version_number: 0,
    })
    .select('version_number')
    .single();

  if (vErr || !version) {
    return { data: null, error: { code: 'DB_ERROR', message: vErr?.message ?? 'version failed' } };
  }

  await supabase
    .from('pieces')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', pieceId);

  return {
    data: { version_number: (version as { version_number: number }).version_number },
    error: null,
  };
}

export async function deletePiece(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string
): Promise<PieceResult<{ deleted: true }>> {
  const { data: piece } = await supabase
    .from('pieces')
    .select('id, author_id')
    .eq('id', pieceId)
    .single();

  if (!piece) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'piece not found' } };
  }
  if ((piece as { author_id: string }).author_id !== authorId) {
    return { data: null, error: { code: 'FORBIDDEN', message: 'not your piece' } };
  }

  const { error } = await supabase.from('pieces').delete().eq('id', pieceId);

  if (error) {
    return { data: null, error: { code: 'DB_ERROR', message: error.message } };
  }

  return { data: { deleted: true }, error: null };
}

export async function listAuthorPieces(
  supabase: SupabaseClient,
  authorId: string
): Promise<PieceResult<PieceSummary[]>> {
  const { data, error } = await supabase
    .from('pieces')
    .select('*, sections(content)')
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: { code: 'DB_ERROR', message: error.message } };
  }

  const rows = (data ?? []) as Array<Piece & { sections?: Array<{ content: string }> }>;
  return {
    data: rows.map((row) => {
      const secs = row.sections ?? [];
      return {
        id: row.id,
        author_id: row.author_id,
        title: row.title,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        section_count: secs.length,
        word_count: secs.reduce((sum, s) => sum + countWords(s.content), 0),
      };
    }),
    error: null,
  };
}

export async function getPublicPiece(
  supabase: SupabaseClient,
  pieceId: string,
  requesterId: string
): Promise<PieceResult<Piece & { sections: Section[] }>> {
  const result = await getPiece(supabase, pieceId);
  if (result.error) return result;

  if (result.data.status === 'draft' && result.data.author_id !== requesterId) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'piece not found' } };
  }

  return result;
}

export async function setStatus(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string,
  status: PieceStatus
): Promise<PieceResult<Piece>> {
  return updatePiece(supabase, pieceId, authorId, { status });
}
