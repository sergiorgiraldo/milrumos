import fs from 'fs';
import path from 'path';
import { TABLES, RLS_RULES, PIECE_STATUSES } from '@/lib/schema';

const MIGRATION_FILE = path.join(process.cwd(), 'supabase', 'migrations', '0001_initial_schema.sql');
const SECURE_MIGRATION_FILE = path.join(process.cwd(), 'supabase', 'migrations', '0006_secure_supabase.sql');

describe('migration file', () => {
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');
  });

  it('exists', () => {
    expect(fs.existsSync(MIGRATION_FILE)).toBe(true);
  });

  it.each([
    'profiles',
    'pieces',
    'sections',
    'piece_versions',
    'piece_lineage',
    'piece_metadata',
  ])('creates table %s', (table) => {
    expect(sql).toMatch(new RegExp(`create table public\\.${table}`));
  });

  it('sections.content is TEXT', () => {
    // the column definition must appear inside the sections table block
    expect(sql).toMatch(/content\s+text/);
  });

  it('piece_versions has version_number integer', () => {
    expect(sql).toMatch(/version_number\s+integer/);
  });

  it('piece_versions has markdown_snapshot text', () => {
    expect(sql).toMatch(/markdown_snapshot\s+text/);
  });

  it('piece_versions has author_id', () => {
    expect(sql).toMatch(/author_id\s+uuid/);
  });

  it('piece_lineage has parent_piece_id', () => {
    expect(sql).toMatch(/parent_piece_id\s+uuid/);
  });

  it('piece_lineage has fork_section_id', () => {
    expect(sql).toMatch(/fork_section_id\s+uuid/);
  });

  it.each([
    'profiles',
    'pieces',
    'sections',
    'piece_versions',
    'piece_lineage',
    'piece_metadata',
  ])('RLS is enabled on %s', (table) => {
    expect(sql).toMatch(
      new RegExp(`alter table public\\.${table}\\s+enable row level security`)
    );
  });

  it('pieces status check constrains to draft and published', () => {
    expect(sql).toMatch(/check \(status in \('draft', 'published'\)\)/);
  });

  it('version_number auto-increment trigger is defined', () => {
    expect(sql).toMatch(/next_piece_version/);
    expect(sql).toMatch(/trg_piece_versions_version_number/);
  });

  it('new-user trigger creates a profile automatically', () => {
    expect(sql).toMatch(/handle_new_user/);
    expect(sql).toMatch(/trg_on_auth_user_created/);
  });
});

describe('RLS policies in SQL', () => {
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');
  });

  it('owner policy on pieces uses author_id', () => {
    expect(sql).toMatch(/pieces.*owner full access[\s\S]*?author_id/);
  });

  it('public read on pieces is restricted to published status', () => {
    expect(sql).toMatch(/pieces.*public read published[\s\S]*?published/);
  });

  it('draft pieces are NOT mentioned in any public read policy', () => {
    const publicReadBlock = sql.match(
      /create policy "pieces: public read published"[\s\S]*?;/
    )?.[0] ?? '';
    expect(publicReadBlock).not.toContain("'draft'");
  });

  it('sections RLS delegates to parent piece', () => {
    expect(sql).toMatch(/select author_id from public\.pieces where id = piece_id/);
  });

  it('piece_lineage is publicly readable', () => {
    expect(sql).toMatch(/piece_lineage.*public read[\s\S]*?using \(true\)/);
  });
});

describe('RLS rule registry', () => {
  it('every table has at least two rules', () => {
    for (const table of TABLES) {
      const rules = RLS_RULES.filter((r) => r.table === table);
      expect(rules.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all tables are covered', () => {
    const covered = new Set(RLS_RULES.map((r) => r.table));
    for (const table of TABLES) {
      expect(covered.has(table)).toBe(true);
    }
  });

  it('pieces owner rule targets author_id', () => {
    const rule = RLS_RULES.find((r) => r.table === 'pieces' && r.operation === 'ALL');
    expect(rule?.condition).toContain('author_id');
  });

  it('pieces public-read rule targets published status', () => {
    const rule = RLS_RULES.find(
      (r) => r.table === 'pieces' && r.policy === 'public read published'
    );
    expect(rule?.condition).toContain('published');
    expect(rule?.condition).not.toContain('draft');
  });

  it('piece_versions owner rule targets author_id', () => {
    const rule = RLS_RULES.find(
      (r) => r.table === 'piece_versions' && r.operation === 'ALL'
    );
    expect(rule?.condition).toContain('author_id');
  });

  it('sections and piece_metadata owner rules delegate to piece.author_id', () => {
    for (const table of ['sections', 'piece_metadata'] as const) {
      const rule = RLS_RULES.find((r) => r.table === table && r.operation === 'ALL');
      expect(rule?.condition).toContain('piece.author_id');
    }
  });

  it('every "public read" SELECT policy is restricted to authenticated role', () => {
    const publicReadRules = RLS_RULES.filter((r) => r.policy.startsWith('public read'));
    expect(publicReadRules.length).toBeGreaterThan(0);
    for (const rule of publicReadRules) {
      expect(rule.roles).toEqual(['authenticated']);
    }
  });

  it('every owner "ALL" policy applies to public (condition-restricted)', () => {
    const ownerRules = RLS_RULES.filter((r) => r.policy === 'owner full access');
    expect(ownerRules.length).toBeGreaterThan(0);
    for (const rule of ownerRules) {
      expect(rule.roles).toEqual(['public']);
    }
  });
});

describe('0006_secure_supabase migration', () => {
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(SECURE_MIGRATION_FILE, 'utf-8');
  });

  it('exists', () => {
    expect(fs.existsSync(SECURE_MIGRATION_FILE)).toBe(true);
  });

  it.each([
    'profiles: public read',
    'pieces: public read published',
    'sections: public read published',
    'piece_versions: public read published',
    'piece_lineage: public read',
    'piece_metadata: public read published',
  ])('recreates "%s" policy scoped to authenticated', (policyName) => {
    const block = sql.match(
      new RegExp(`create policy "${policyName}"[\\s\\S]*?;`)
    )?.[0] ?? '';
    expect(block).toMatch(/to authenticated/);
  });

  it('restricts EXECUTE on search_pieces and explore_pieces to authenticated', () => {
    expect(sql).toMatch(/revoke execute on function public\.search_pieces\(text, text\) from public/);
    expect(sql).toMatch(/grant execute on function public\.search_pieces\(text, text\) to authenticated/);
    expect(sql).toMatch(
      /revoke execute on function public\.explore_pieces\(text, text, integer, integer\) from public/
    );
    expect(sql).toMatch(
      /grant execute on function public\.explore_pieces\(text, text, integer, integer\) to authenticated/
    );
  });

  it('pins an empty search_path on all four functions', () => {
    expect(sql).toMatch(/alter function public\.handle_new_user\(\) set search_path = ''/);
    expect(sql).toMatch(/alter function public\.next_piece_version\(\) set search_path = ''/);
    expect(sql).toMatch(/alter function public\.search_pieces\(text, text\) set search_path = ''/);
    expect(sql).toMatch(
      /alter function public\.explore_pieces\(text, text, integer, integer\) set search_path = ''/
    );
  });
});

describe('schema type constants', () => {
  it('TABLES contains all six required tables', () => {
    const required = [
      'profiles', 'pieces', 'sections',
      'piece_versions', 'piece_lineage', 'piece_metadata',
    ];
    for (const t of required) {
      expect(TABLES).toContain(t);
    }
    expect(TABLES).toHaveLength(required.length);
  });

  it('PIECE_STATUSES contains draft and published only', () => {
    expect(PIECE_STATUSES).toEqual(expect.arrayContaining(['draft', 'published']));
    expect(PIECE_STATUSES).toHaveLength(2);
  });
});
