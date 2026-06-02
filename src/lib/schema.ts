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

export interface PieceMetadata {
  id: string;
  piece_id: string;
  genre: string | null;
  tags: string[];
  updated_at: string;
}

// ---- RLS rule registry -------------------------------------------------------

export interface RlsRule {
  table: TableName;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  policy: string;
  condition: string;
}

export const RLS_RULES: RlsRule[] = [
  { table: 'profiles', operation: 'ALL',    policy: 'owner full access',       condition: 'auth.uid() = id' },
  { table: 'profiles', operation: 'SELECT', policy: 'public read',              condition: 'true' },

  { table: 'pieces',   operation: 'ALL',    policy: 'owner full access',        condition: 'auth.uid() = author_id' },
  { table: 'pieces',   operation: 'SELECT', policy: 'public read published',    condition: "status = 'published'" },

  { table: 'sections', operation: 'ALL',    policy: 'owner full access',        condition: 'auth.uid() = piece.author_id' },
  { table: 'sections', operation: 'SELECT', policy: 'public read published',    condition: "piece.status = 'published'" },

  { table: 'piece_versions', operation: 'ALL',    policy: 'owner full access',     condition: 'auth.uid() = author_id' },
  { table: 'piece_versions', operation: 'SELECT', policy: 'public read published', condition: "piece.status = 'published'" },

  { table: 'piece_lineage', operation: 'ALL',    policy: 'owner full access',  condition: 'auth.uid() = piece.author_id' },
  { table: 'piece_lineage', operation: 'SELECT', policy: 'public read',        condition: 'true' },

  { table: 'piece_metadata', operation: 'ALL',    policy: 'owner full access',     condition: 'auth.uid() = piece.author_id' },
  { table: 'piece_metadata', operation: 'SELECT', policy: 'public read published', condition: "piece.status = 'published'" },
];
