'use client';

import { useState, KeyboardEvent } from 'react';
import { GENRES } from '@/lib/schema';

interface Props {
  genre: string | null;
  tags: string[];
  ideaSummary: string | null;
  onGenreChange: (genre: string | null) => void;
  onTagsChange: (tags: string[]) => void;
  onSummaryChange: (summary: string) => void;
}

export default function MetadataPanel({
  genre,
  tags,
  ideaSummary,
  onGenreChange,
  onTagsChange,
  onSummaryChange,
}: Props) {
  const [tagInput, setTagInput] = useState('');

  const commitTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      onTagsChange([...tags, val]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-pale-slate-700 uppercase tracking-wide">
        Metadata
      </h3>

      {/* Genre */}
      <div>
        <label className="block text-xs font-medium text-pale-slate-600 mb-1">Genre</label>
        <select
          value={genre ?? ''}
          onChange={(e) => onGenreChange(e.target.value || null)}
          className="w-full px-3 py-1.5 rounded-lg border border-pale-slate-200 text-sm text-pale-slate-800 bg-white focus:outline-none focus:border-air-force-blue-400"
          aria-label="Genre"
        >
          <option value="">— Select genre —</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-pale-slate-600 mb-1">
          Tags <span className="text-pale-slate-400 font-normal">(Enter or comma to add)</span>
        </label>
        <div className="rounded-lg border border-pale-slate-200 px-2 py-1.5 flex flex-wrap gap-1.5 focus-within:border-air-force-blue-400 bg-white min-h-[38px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-blue-100 text-sky-blue-700 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
                className="hover:text-ruby-red-600 leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => {
              const val = e.target.value;
              if (val.endsWith(',')) {
                setTagInput(val.slice(0, -1));
                setTimeout(() => commitTag(), 0);
              } else {
                setTagInput(val);
              }
            }}
            onKeyDown={handleTagKeyDown}
            onBlur={commitTag}
            placeholder={tags.length === 0 ? 'e.g. adventure, mystery' : ''}
            className="flex-1 min-w-[80px] text-sm focus:outline-none bg-transparent"
            aria-label="Add tag"
          />
        </div>
      </div>

      {/* Idea / Summary */}
      <div>
        <label className="block text-xs font-medium text-pale-slate-600 mb-1">Idea / Summary</label>
        <textarea
          value={ideaSummary ?? ''}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={4}
          placeholder="Short description or idea behind this piece…"
          className="w-full px-3 py-2 rounded-lg border border-pale-slate-200 text-sm text-pale-slate-800 resize-none focus:outline-none focus:border-air-force-blue-400 bg-white"
          aria-label="Idea or summary"
        />
      </div>
    </div>
  );
}
