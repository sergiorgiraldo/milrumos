'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useEffect, useRef } from 'react';
import EditorToolbar from './EditorToolbar';

interface Props {
  initialContent: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

export default function SectionEditor({ initialContent, onChange, placeholder }: Props) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[120px] focus:outline-none px-4 py-3 font-sans text-pale-slate-800',
      },
    },
    onUpdate({ editor: e }) {
      const storage = e.storage as unknown as { markdown: { getMarkdown: () => string } };
      onChangeRef.current(storage.markdown.getMarkdown());
    },
  });

  if (!editor) {
    return (
      <div
        className="min-h-[120px] bg-pale-slate-50 rounded animate-pulse"
        aria-label={placeholder ?? 'Loading editor…'}
      />
    );
  }

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        aria-label={placeholder ?? 'Section content'}
      />
    </div>
  );
}
