'use client';

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  applyBold,
  applyItalic,
  applyHeading,
  applyBulletList,
  applyOrderedList,
  applyLink,
  type HeadingLevel,
} from '@/lib/editorToolbar';

interface Props {
  editor: Editor;
}

function buttonClass(active: boolean): string {
  return `min-w-[2rem] px-2 py-1 rounded-md text-sm font-medium transition-colors ${
    active
      ? 'bg-ruby-red-50 text-ruby-red-700'
      : 'text-pale-slate-600 hover:bg-pale-slate-100'
  }`;
}

export default function EditorToolbar({ editor }: Props) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      h1: e.isActive('heading', { level: 1 }),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      link: e.isActive('link'),
    }),
  });

  const handleHeading = (level: HeadingLevel) => applyHeading(editor, level);

  const handleLink = () => {
    const current = (editor.getAttributes('link').href as string | undefined) ?? '';
    const url = window.prompt('Link URL (leave empty to remove the link)', current);
    if (url === null) return;
    applyLink(editor, url);
  };

  return (
    <div
      role="toolbar"
      aria-label="Formatting toolbar"
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-pale-slate-200 bg-pale-slate-50 rounded-t-lg"
    >
      <button
        type="button"
        aria-label="Bold"
        aria-pressed={state.bold}
        onClick={() => applyBold(editor)}
        className={buttonClass(state.bold)}
      >
        <span className="font-bold">B</span>
      </button>
      <button
        type="button"
        aria-label="Italic"
        aria-pressed={state.italic}
        onClick={() => applyItalic(editor)}
        className={buttonClass(state.italic)}
      >
        <span className="italic">I</span>
      </button>

      <span className="w-px h-5 bg-pale-slate-200 mx-1" aria-hidden="true" />

      <button
        type="button"
        aria-label="Heading 1"
        aria-pressed={state.h1}
        onClick={() => handleHeading(1)}
        className={buttonClass(state.h1)}
      >
        H1
      </button>
      <button
        type="button"
        aria-label="Heading 2"
        aria-pressed={state.h2}
        onClick={() => handleHeading(2)}
        className={buttonClass(state.h2)}
      >
        H2
      </button>
      <button
        type="button"
        aria-label="Heading 3"
        aria-pressed={state.h3}
        onClick={() => handleHeading(3)}
        className={buttonClass(state.h3)}
      >
        H3
      </button>

      <span className="w-px h-5 bg-pale-slate-200 mx-1" aria-hidden="true" />

      <button
        type="button"
        aria-label="Bullet list"
        aria-pressed={state.bulletList}
        onClick={() => applyBulletList(editor)}
        className={buttonClass(state.bulletList)}
      >
        ••
      </button>
      <button
        type="button"
        aria-label="Numbered list"
        aria-pressed={state.orderedList}
        onClick={() => applyOrderedList(editor)}
        className={buttonClass(state.orderedList)}
      >
        1.
      </button>

      <span className="w-px h-5 bg-pale-slate-200 mx-1" aria-hidden="true" />

      <button
        type="button"
        aria-label="Link"
        aria-pressed={state.link}
        onClick={handleLink}
        className={buttonClass(state.link)}
      >
        🔗
      </button>
    </div>
  );
}
