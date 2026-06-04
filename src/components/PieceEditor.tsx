'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SectionEditor from './SectionEditor';
import {
  SectionData,
  addSection,
  deleteSection,
  moveSection,
  renameSection,
  updateSectionContent,
  sectionsWordCount,
  countWords,
} from '@/lib/editor';

interface Props {
  pieceId: string;
  initialTitle: string;
  initialSections: SectionData[];
  initialStatus: 'draft' | 'published';
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY = 1500;

export default function PieceEditor({ pieceId, initialTitle, initialSections, initialStatus }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [sections, setSections] = useState<SectionData[]>(
    initialSections.length > 0
      ? initialSections
      : [{ ordinal: 1, title: null, content: '' }]
  );
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);

  const sectionsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveTitle = useCallback(
    async (nextTitle: string) => {
      const res = await fetch(`/api/pieces/${pieceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!res.ok) setSaveState('error');
    },
    [pieceId]
  );

  const saveSections = useCallback(
    async (currentSections: SectionData[]) => {
      setSaveState('saving');
      try {
        const res = await fetch(`/api/pieces/${pieceId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections: currentSections }),
        });
        setSaveState(res.ok ? 'saved' : 'error');
      } catch {
        setSaveState('error');
      }
    },
    [pieceId]
  );

  const scheduleSectionsSave = useCallback(
    (current: SectionData[]) => {
      if (sectionsTimerRef.current) clearTimeout(sectionsTimerRef.current);
      sectionsTimerRef.current = setTimeout(() => saveSections(current), AUTOSAVE_DELAY);
    },
    [saveSections]
  );

  const scheduleTitleSave = useCallback(
    (next: string) => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      titleTimerRef.current = setTimeout(() => saveTitle(next), AUTOSAVE_DELAY);
    },
    [saveTitle]
  );

  useEffect(() => {
    return () => {
      if (sectionsTimerRef.current) clearTimeout(sectionsTimerRef.current);
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, []);

  const handleTitleChange = (next: string) => {
    setTitle(next);
    scheduleTitleSave(next);
  };

  const handleContentChange = (index: number, content: string) => {
    const next = updateSectionContent(sections, index, content);
    setSections(next);
    scheduleSectionsSave(next);
  };

  const handleAddSection = () => {
    const next = addSection(sections);
    setSections(next);
    scheduleSectionsSave(next);
  };

  const handleDeleteSection = (index: number) => {
    const next = deleteSection(sections, index);
    setSections(next);
    scheduleSectionsSave(next);
  };

  const handleMoveUp = (index: number) => {
    const next = moveSection(sections, index, index - 1);
    setSections(next);
    scheduleSectionsSave(next);
  };

  const handleMoveDown = (index: number) => {
    const next = moveSection(sections, index, index + 1);
    setSections(next);
    scheduleSectionsSave(next);
  };

  const handleRename = (index: number, newTitle: string) => {
    const next = renameSection(sections, index, newTitle);
    setSections(next);
    setEditingTitleIndex(null);
    scheduleSectionsSave(next);
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    const nextStatus = status === 'draft' ? 'published' : 'draft';
    try {
      const res = await fetch(`/api/pieces/${pieceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) setStatus(nextStatus);
    } finally {
      setPublishing(false);
    }
  };

  const totalWords = sectionsWordCount(sections);

  return (
    <div className="min-h-screen bg-pale-slate-50 flex flex-col">
      {/* Toolbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-pale-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="/"
            className="text-ruby-red-600 font-bold text-lg shrink-0 hover:text-ruby-red-700"
          >
            Milrumos
          </a>
          <span className="text-pale-slate-300">|</span>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="font-semibold text-pale-slate-800 bg-transparent border-b border-transparent hover:border-pale-slate-300 focus:border-air-force-blue-400 focus:outline-none min-w-[200px] truncate"
            aria-label="Piece title"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-pale-slate-400 text-sm">{totalWords} words</span>

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              saveState === 'saving'
                ? 'bg-sky-blue-100 text-sky-blue-700'
                : saveState === 'saved'
                ? 'bg-air-force-blue-100 text-air-force-blue-700'
                : saveState === 'error'
                ? 'bg-ruby-red-100 text-ruby-red-700'
                : 'text-pale-slate-400'
            }`}
          >
            {saveState === 'saving'
              ? 'Saving…'
              : saveState === 'saved'
              ? 'Saved'
              : saveState === 'error'
              ? 'Save error'
              : status === 'draft'
              ? 'Draft'
              : ''}
          </span>

          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              status === 'published'
                ? 'bg-air-force-blue-100 text-air-force-blue-700'
                : 'bg-pale-slate-100 text-pale-slate-500'
            }`}
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </span>

          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              status === 'draft'
                ? 'bg-ruby-red-600 text-white hover:bg-ruby-red-700'
                : 'bg-pale-slate-200 text-pale-slate-700 hover:bg-pale-slate-300'
            }`}
          >
            {publishing ? '…' : status === 'draft' ? 'Publish' : 'Unpublish'}
          </button>
        </div>
      </header>

      {/* Editor body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {sections.map((section, index) => (
          <div
            key={`${section.ordinal}-${index}`}
            className="bg-white rounded-xl shadow-sm border border-pale-slate-200"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-pale-slate-100">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label="Move section up"
                  className="text-pale-slate-400 hover:text-pale-slate-600 disabled:opacity-30 text-xs leading-none"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sections.length - 1}
                  aria-label="Move section down"
                  className="text-pale-slate-400 hover:text-pale-slate-600 disabled:opacity-30 text-xs leading-none"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                {editingTitleIndex === index ? (
                  <input
                    autoFocus
                    defaultValue={section.title ?? ''}
                    onBlur={(e) => handleRename(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(index, (e.target as HTMLInputElement).value);
                      if (e.key === 'Escape') setEditingTitleIndex(null);
                    }}
                    className="w-full text-sm font-medium text-pale-slate-700 border-b border-air-force-blue-400 focus:outline-none bg-transparent"
                    aria-label="Section title"
                  />
                ) : (
                  <button
                    onClick={() => setEditingTitleIndex(index)}
                    className="text-sm font-medium text-pale-slate-600 hover:text-pale-slate-800 truncate max-w-full text-left"
                    aria-label={`Rename section ${index + 1}`}
                  >
                    {section.title ?? `Section ${index + 1}`}
                  </button>
                )}
              </div>

              <span className="text-xs text-pale-slate-400 shrink-0">
                {countWords(section.content)} words
              </span>

              <button
                onClick={() => handleDeleteSection(index)}
                disabled={sections.length === 1}
                aria-label="Delete section"
                className="text-pale-slate-300 hover:text-ruby-red-500 disabled:opacity-30 text-sm ml-1"
              >
                ✕
              </button>
            </div>

            {/* TipTap editor */}
            <SectionEditor
              initialContent={section.content}
              onChange={(md) => handleContentChange(index, md)}
              placeholder={`Write section ${index + 1}…`}
            />
          </div>
        ))}

        <button
          onClick={handleAddSection}
          className="w-full py-3 rounded-xl border-2 border-dashed border-pale-slate-300 text-pale-slate-500 hover:border-air-force-blue-400 hover:text-air-force-blue-600 transition-colors text-sm font-medium"
          aria-label="Add section"
        >
          + Add section
        </button>
      </main>
    </div>
  );
}
