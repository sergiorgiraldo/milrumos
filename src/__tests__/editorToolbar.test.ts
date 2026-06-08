import {
  applyBold,
  applyItalic,
  applyHeading,
  applyBulletList,
  applyOrderedList,
  applyLink,
} from '@/lib/editorToolbar';
import type { Editor } from '@tiptap/core';

// ---- chainable command-recorder mock ---------------------------------------------
//
// Mirrors the shape of editor.chain()....run() used by every toolbar action: each
// command method returns the chain itself so calls can be fluently composed, and the
// recorder captures the exact sequence (with args) so we can assert on the markdown
// command that gets dispatched without needing a real ProseMirror instance.

function makeEditor() {
  const calls: string[] = [];
  const record = (name: string, ...args: unknown[]) => {
    calls.push(args.length ? `${name}(${JSON.stringify(args[0])})` : name);
    return chain;
  };

  const chain = {
    focus: () => record('focus'),
    toggleBold: () => record('toggleBold'),
    toggleItalic: () => record('toggleItalic'),
    toggleHeading: (attrs: { level: number }) => record('toggleHeading', attrs),
    toggleBulletList: () => record('toggleBulletList'),
    toggleOrderedList: () => record('toggleOrderedList'),
    extendMarkRange: (name: string) => record('extendMarkRange', name),
    setLink: (attrs: { href: string }) => record('setLink', attrs),
    unsetLink: () => record('unsetLink'),
    run: () => {
      calls.push('run');
      return true;
    },
  };

  const editor = { chain: () => chain } as unknown as Editor;
  return { editor, calls };
}

describe('applyBold', () => {
  it('toggles the bold mark on the current selection', () => {
    const { editor, calls } = makeEditor();
    applyBold(editor);
    expect(calls).toEqual(['focus', 'toggleBold', 'run']);
  });
});

describe('applyItalic', () => {
  it('toggles the italic mark on the current selection', () => {
    const { editor, calls } = makeEditor();
    applyItalic(editor);
    expect(calls).toEqual(['focus', 'toggleItalic', 'run']);
  });
});

describe('applyHeading', () => {
  it.each([1, 2, 3] as const)('toggles a level-%d heading', (level) => {
    const { editor, calls } = makeEditor();
    applyHeading(editor, level);
    expect(calls).toEqual(['focus', `toggleHeading(${JSON.stringify({ level })})`, 'run']);
  });
});

describe('applyBulletList', () => {
  it('toggles a bullet list on the current selection', () => {
    const { editor, calls } = makeEditor();
    applyBulletList(editor);
    expect(calls).toEqual(['focus', 'toggleBulletList', 'run']);
  });
});

describe('applyOrderedList', () => {
  it('toggles a numbered list on the current selection', () => {
    const { editor, calls } = makeEditor();
    applyOrderedList(editor);
    expect(calls).toEqual(['focus', 'toggleOrderedList', 'run']);
  });
});

describe('applyLink', () => {
  it('sets a link mark with the trimmed href when a URL is provided', () => {
    const { editor, calls } = makeEditor();
    applyLink(editor, '  https://example.com  ');
    expect(calls).toEqual([
      'focus',
      'extendMarkRange("link")',
      `setLink(${JSON.stringify({ href: 'https://example.com' })})`,
      'run',
    ]);
  });

  it('removes the link mark when the URL is empty', () => {
    const { editor, calls } = makeEditor();
    applyLink(editor, '');
    expect(calls).toEqual(['focus', 'extendMarkRange("link")', 'unsetLink', 'run']);
  });

  it('removes the link mark when the URL is null', () => {
    const { editor, calls } = makeEditor();
    applyLink(editor, null);
    expect(calls).toEqual(['focus', 'extendMarkRange("link")', 'unsetLink', 'run']);
  });

  it('removes the link mark when the URL is only whitespace', () => {
    const { editor, calls } = makeEditor();
    applyLink(editor, '   ');
    expect(calls).toEqual(['focus', 'extendMarkRange("link")', 'unsetLink', 'run']);
  });
});
