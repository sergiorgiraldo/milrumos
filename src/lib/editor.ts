export interface SectionData {
  id?: string;
  ordinal: number;
  title: string | null;
  content: string;
}

export function countWords(markdown: string): number {
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>[\]()!#|\\]/g, ' ')
    .trim();
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function sectionsWordCount(sections: SectionData[]): number {
  return sections.reduce((sum, s) => sum + countWords(s.content), 0);
}

export function addSection(sections: SectionData[]): SectionData[] {
  return [...sections, { ordinal: sections.length + 1, title: null, content: '' }];
}

export function deleteSection(sections: SectionData[], index: number): SectionData[] {
  return sections
    .filter((_, i) => i !== index)
    .map((s, i) => ({ ...s, ordinal: i + 1 }));
}

export function moveSection(sections: SectionData[], from: number, to: number): SectionData[] {
  if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) {
    return sections;
  }
  const result = [...sections];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result.map((s, i) => ({ ...s, ordinal: i + 1 }));
}

export function renameSection(sections: SectionData[], index: number, title: string): SectionData[] {
  return sections.map((s, i) => (i === index ? { ...s, title: title.trim() || null } : s));
}

export function updateSectionContent(sections: SectionData[], index: number, content: string): SectionData[] {
  return sections.map((s, i) => (i === index ? { ...s, content } : s));
}

export function makeDebounced(fn: (sections: SectionData[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    schedule(sections: SectionData[]) {
      clearTimeout(timer);
      timer = setTimeout(() => fn(sections), delay);
    },
    cancel() {
      clearTimeout(timer);
    },
  };
}
