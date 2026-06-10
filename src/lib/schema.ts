export type PieceStatus = 'draft' | 'published';

export const PIECE_STATUSES: PieceStatus[] = ['draft', 'published'];

export const TABLES = [
  'profiles',
  'pieces',
  'sections',
  'piece_versions',
  'piece_lineage',
  'piece_metadata',
] as const;

export type TableName = (typeof TABLES)[number];

// ---- Row types ---------------------------------------------------------------

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Piece {
  id: string;
  author_id: string;
  title: string;
  status: PieceStatus;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  piece_id: string;
  ordinal: number;
  title: string | null;
  content: string; // raw markdown
  created_at: string;
  updated_at: string;
}

export interface PieceVersion {
  id: string;
  piece_id: string;
  version_number: number;
  markdown_snapshot: string;
  author_id: string;
  created_at: string;
}

export interface PieceLineage {
  id: string;
  piece_id: string;
  parent_piece_id: string;
  fork_section_id: string | null;
  created_at: string;
}

export const GENRES = [
  'Fiction',
  'Non-fiction',
  'Poetry',
  'Essay',
  'Fantasy',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Other',
] as const;

export type Genre = (typeof GENRES)[number];

export interface PieceMetadata {
  id: string;
  piece_id: string;
  genre: string | null;
  tags: string[];
  idea_summary: string | null;
  updated_at: string;
}

// ---- RLS rule registry -------------------------------------------------------

export interface RlsRule {
  table: TableName;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  policy: string;
  condition: string;
  /**
   * Postgres role(s) the policy applies `to`. 'public' means no `to` clause
   * (every role, including `anon`); the row-level `condition` is what
   * restricts access in that case. 'authenticated' means the policy carries
   * an explicit `to authenticated` clause, so `anon` gets no rows at all.
   */
  roles: ('public' | 'authenticated')[];
}

export const RLS_RULES: RlsRule[] = [
  { table: 'profiles', operation: 'ALL',    policy: 'owner full access',       condition: 'auth.uid() = id', roles: ['public'] },
  { table: 'profiles', operation: 'SELECT', policy: 'public read',              condition: 'true', roles: ['authenticated'] },

  { table: 'pieces',   operation: 'ALL',    policy: 'owner full access',        condition: 'auth.uid() = author_id', roles: ['public'] },
  { table: 'pieces',   operation: 'SELECT', policy: 'public read published',    condition: "status = 'published'", roles: ['authenticated'] },

  { table: 'sections', operation: 'ALL',    policy: 'owner full access',        condition: 'auth.uid() = piece.author_id', roles: ['public'] },
  { table: 'sections', operation: 'SELECT', policy: 'public read published',    condition: "piece.status = 'published'", roles: ['authenticated'] },

  { table: 'piece_versions', operation: 'ALL',    policy: 'owner full access',     condition: 'auth.uid() = author_id', roles: ['public'] },
  { table: 'piece_versions', operation: 'SELECT', policy: 'public read published', condition: "piece.status = 'published'", roles: ['authenticated'] },

  { table: 'piece_lineage', operation: 'ALL',    policy: 'owner full access',  condition: 'auth.uid() = piece.author_id', roles: ['public'] },
  { table: 'piece_lineage', operation: 'SELECT', policy: 'public read',        condition: 'true', roles: ['authenticated'] },

  { table: 'piece_metadata', operation: 'ALL',    policy: 'owner full access',     condition: 'auth.uid() = piece.author_id', roles: ['public'] },
  { table: 'piece_metadata', operation: 'SELECT', policy: 'public read published', condition: "piece.status = 'published'", roles: ['authenticated'] },
];
