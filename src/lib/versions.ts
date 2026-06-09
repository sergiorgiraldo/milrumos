import type { SupabaseClient } from '@supabase/supabase-js';
import { countWords } from './editor';
import { savePiece, type PieceError, type PieceResult } from './pieces';

export interface VersionSummary {
  id: string;
  version_number: number;
  created_at: string;
  word_count: number;
  markdown_snapshot: string;
}

interface ParsedSnapshot {
  title: string;
  sections: Array<{ title: string | null; content: string }>;
}

/**
 * Inverse of pieces.ts#buildSnapshot: reconstructs the title and ordered
 * sections from a full markdown snapshot ("# Title" then "## Section Title"
 * blocks). Sections without a title are kept as untitled blocks.
 */
export function parseSnapshot(markdown: string): ParsedSnapshot {
  const lines = markdown.split('\n');
  let title = '';
  const sections: Array<{ title: string | null; content: string[] }> = [];
  let current: { title: string | null; content: string[] } | null = null;

  for (const line of lines) {
    if (!title) {
      const titleMatch = /^#\s+(.+)$/.exec(line);
      if (titleMatch) {
        title = titleMatch[1].trim();
        continue;
      }
    }

    const sectionMatch = /^##\s+(.+)$/.exec(line);
    if (sectionMatch) {
      if (current) sections.push(current);
      current = { title: sectionMatch[1].trim(), content: [] };
      continue;
    }

    if (!current) current = { title: null, content: [] };
    current.content.push(line);
  }
  if (current) sections.push(current);

  return {
    title,
    sections: sections
      .map((s) => ({ title: s.title, content: s.content.join('\n').trim() }))
      .filter((s) => s.title || s.content),
  };
}

async function assertOwner(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string
): Promise<PieceError | null> {
  const { data: piece } = await supabase.from('pieces').select('id, author_id').eq('id', pieceId).single();

  if (!piece) return { code: 'NOT_FOUND', message: 'piece not found' };
  if ((piece as { author_id: string }).author_id !== authorId) {
    return { code: 'FORBIDDEN', message: 'not your piece' };
  }
  return null;
}

export async function listVersions(
  supabase: SupabaseClient,
  pieceId: string,
  authorId: string
): Promise<PieceResult<VersionSummary[]>> {
  const ownerError = await assertOwner(supabase, pieceId, authorId);
  if (ownerError) return { data: null, error: ownerError };

  const { data, error } = await supabase
    .from('piece_versions')
    .select('id, version_number, markdown_snapshot, created_at')
    .eq('piece_id', pieceId)
    .order('version_number', { ascending: false });

  if (error) {
    return { data: null, error: { code: 'DB_ERROR', message: error.message } };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    version_number: number;
    markdown_snapshot: string;
    created_at: string;
  }>;

  return {
    data: rows.map((row) => ({
      id: row.id,
      version_number: row.version_number,
      created_at: row.created_at,
      word_count: countWords(row.markdown_snapshot),
      markdown_snapshot: row.markdown_snapshot,
    })),
    error: null,
  };
}

export async function restoreVersion(
  supabase: SupabaseClient,
  pieceId: string,
  versionId: string,
  authorId: string
): Promise<PieceResult<{ version_number: number }>> {
  const ownerError = await assertOwner(supabase, pieceId, authorId);
  if (ownerError) return { data: null, error: ownerError };

  const { data: version } = await supabase
    .from('piece_versions')
    .select('id, piece_id, markdown_snapshot')
    .eq('id', versionId)
    .single();

  if (!version) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'version not found' } };
  }
  const v = version as { piece_id: string; markdown_snapshot: string };
  if (v.piece_id !== pieceId) {
    return { data: null, error: { code: 'NOT_FOUND', message: 'version not found' } };
  }

  const parsed = parseSnapshot(v.markdown_snapshot);
  const sections = parsed.sections.map((s, i) => ({
    ordinal: i + 1,
    title: s.title,
    content: s.content,
  }));

  return savePiece(supabase, pieceId, authorId, sections);
}
