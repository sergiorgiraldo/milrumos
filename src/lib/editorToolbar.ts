import type { Editor } from '@tiptap/core';

export type HeadingLevel = 1 | 2 | 3;

export function applyBold(editor: Editor): void {
  editor.chain().focus().toggleBold().run();
}

export function applyItalic(editor: Editor): void {
  editor.chain().focus().toggleItalic().run();
}

export function applyHeading(editor: Editor, level: HeadingLevel): void {
  editor.chain().focus().toggleHeading({ level }).run();
}

export function applyBulletList(editor: Editor): void {
  editor.chain().focus().toggleBulletList().run();
}

export function applyOrderedList(editor: Editor): void {
  editor.chain().focus().toggleOrderedList().run();
}

/**
 * Applies (or removes, when `url` is empty) a link mark on the current
 * selection. Uses extendMarkRange so clicking inside an existing link
 * updates the whole link rather than just the clicked-on fragment.
 */
export function applyLink(editor: Editor, url: string | null): void {
  const trimmed = url?.trim() ?? '';
  const chain = editor.chain().focus().extendMarkRange('link');
  if (trimmed) {
    chain.setLink({ href: trimmed }).run();
  } else {
    chain.unsetLink().run();
  }
}
