'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ForkSection {
  id: string;
  title: string | null;
  html: string;
}

interface Props {
  sections: ForkSection[];
  pieceId: string;
  showForkButtons: boolean;
}

export default function ForkPanel({ sections, pieceId, showForkButtons }: Props) {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);

  const handleFork = async (sectionId: string) => {
    setForking(true);
    setForkError(null);
    try {
      const res = await fetch('/api/pieces/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piece_id: pieceId, section_id: sectionId }),
      });
      if (!res.ok) {
        const body = await res.json();
        setForkError(body.error ?? 'Fork failed');
        return;
      }
      const newPiece = await res.json();
      router.push(`/pieces/${newPiece.id}/edit`);
    } catch {
      setForkError('Network error');
    } finally {
      setForking(false);
    }
  };

  return (
    <div className="space-y-10">
      {forkError && (
        <div className="rounded-lg bg-ruby-red-100 text-ruby-red-700 px-4 py-2 text-sm">
          {forkError}
        </div>
      )}

      {sections.map((section, index) => {
        const isHighlighted =
          showForkButtons && hoveredIndex !== null && index <= hoveredIndex;

        return (
          <section
            key={section.id}
            className={`rounded-xl transition-colors duration-150 ${
              isHighlighted ? 'bg-sky-blue-50 ring-1 ring-sky-blue-200 px-4 py-2 -mx-4' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {section.title && (
                  <h2 className="text-xl font-semibold text-pale-slate-800 mb-4">
                    {section.title}
                  </h2>
                )}
                <div
                  className="prose prose-slate max-w-none text-pale-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.html }}
                />
              </div>

              {showForkButtons && (
                <button
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => handleFork(section.id)}
                  disabled={forking}
                  aria-label={`Fork from section ${index + 1}`}
                  className="shrink-0 mt-1 px-3 py-1.5 rounded-lg border border-air-force-blue-300 text-air-force-blue-600 text-xs font-medium hover:bg-air-force-blue-50 hover:border-air-force-blue-400 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  Fork from here
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
