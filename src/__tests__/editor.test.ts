import {
  countWords,
  sectionsWordCount,
  addSection,
  deleteSection,
  moveSection,
  renameSection,
  updateSectionContent,
  makeDebounced,
  type SectionData,
} from '@/lib/editor';

const makeSection = (ordinal: number, content = '', title: string | null = null): SectionData => ({
  ordinal,
  title,
  content,
});

// ---- countWords -----------------------------------------------------------------

describe('countWords', () => {
  it('counts plain words', () => {
    expect(countWords('Hello world foo')).toBe(3);
  });

  it('strips markdown headings', () => {
    expect(countWords('## My Title\n\nSome text here')).toBe(5);
  });

  it('strips bold and italic markers', () => {
    expect(countWords('**bold** and _italic_ text')).toBe(4);
  });

  it('strips code blocks', () => {
    expect(countWords('Before\n```\ncode here\n```\nAfter')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });
});

// ---- sectionsWordCount ----------------------------------------------------------

describe('sectionsWordCount', () => {
  it('sums words across all sections', () => {
    const sections = [
      makeSection(1, 'Hello world'),
      makeSection(2, 'three more words'),
    ];
    expect(sectionsWordCount(sections)).toBe(5);
  });

  it('returns 0 for empty sections array', () => {
    expect(sectionsWordCount([])).toBe(0);
  });
});

// ---- addSection -----------------------------------------------------------------

describe('addSection', () => {
  it('appends a new section with next ordinal', () => {
    const sections = [makeSection(1, 'first')];
    const result = addSection(sections);
    expect(result).toHaveLength(2);
    expect(result[1].ordinal).toBe(2);
    expect(result[1].content).toBe('');
    expect(result[1].title).toBeNull();
  });

  it('works on empty list', () => {
    const result = addSection([]);
    expect(result).toHaveLength(1);
    expect(result[0].ordinal).toBe(1);
  });

  it('does not mutate original array', () => {
    const original = [makeSection(1)];
    addSection(original);
    expect(original).toHaveLength(1);
  });
});

// ---- deleteSection --------------------------------------------------------------

describe('deleteSection', () => {
  it('removes the section at given index', () => {
    const sections = [makeSection(1, 'a'), makeSection(2, 'b'), makeSection(3, 'c')];
    const result = deleteSection(sections, 1);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.content)).toEqual(['a', 'c']);
  });

  it('re-numbers ordinals after deletion', () => {
    const sections = [makeSection(1), makeSection(2), makeSection(3)];
    const result = deleteSection(sections, 0);
    expect(result.map((s) => s.ordinal)).toEqual([1, 2]);
  });

  it('does not mutate original array', () => {
    const original = [makeSection(1), makeSection(2)];
    deleteSection(original, 0);
    expect(original).toHaveLength(2);
  });
});

// ---- moveSection ----------------------------------------------------------------

describe('moveSection', () => {
  it('moves a section up', () => {
    const sections = [makeSection(1, 'a'), makeSection(2, 'b'), makeSection(3, 'c')];
    const result = moveSection(sections, 1, 0);
    expect(result.map((s) => s.content)).toEqual(['b', 'a', 'c']);
  });

  it('moves a section down', () => {
    const sections = [makeSection(1, 'a'), makeSection(2, 'b'), makeSection(3, 'c')];
    const result = moveSection(sections, 0, 2);
    expect(result.map((s) => s.content)).toEqual(['b', 'c', 'a']);
  });

  it('updates ordinals after move', () => {
    const sections = [makeSection(1, 'a'), makeSection(2, 'b'), makeSection(3, 'c')];
    const result = moveSection(sections, 2, 0);
    expect(result.map((s) => s.ordinal)).toEqual([1, 2, 3]);
    expect(result.map((s) => s.content)).toEqual(['c', 'a', 'b']);
  });

  it('returns same array when from === to', () => {
    const sections = [makeSection(1, 'a'), makeSection(2, 'b')];
    const result = moveSection(sections, 1, 1);
    expect(result).toEqual(sections);
  });

  it('returns same array for out-of-bounds index', () => {
    const sections = [makeSection(1)];
    expect(moveSection(sections, 0, 5)).toEqual(sections);
    expect(moveSection(sections, -1, 0)).toEqual(sections);
  });
});

// ---- renameSection --------------------------------------------------------------

describe('renameSection', () => {
  it('sets a section title', () => {
    const sections = [makeSection(1, '', null), makeSection(2, '', null)];
    const result = renameSection(sections, 0, 'Chapter One');
    expect(result[0].title).toBe('Chapter One');
    expect(result[1].title).toBeNull();
  });

  it('sets title to null when blank string provided', () => {
    const sections = [makeSection(1, '', 'Old Title')];
    const result = renameSection(sections, 0, '   ');
    expect(result[0].title).toBeNull();
  });
});

// ---- updateSectionContent -------------------------------------------------------

describe('updateSectionContent', () => {
  it('updates content at given index', () => {
    const sections = [makeSection(1, 'old'), makeSection(2, 'keep')];
    const result = updateSectionContent(sections, 0, 'new content');
    expect(result[0].content).toBe('new content');
    expect(result[1].content).toBe('keep');
  });
});

// ---- markdown round-trip --------------------------------------------------------

describe('markdown round-trip (countWords stability)', () => {
  it('produces the same word count for equivalent markdown', () => {
    const md1 = '**Hello** world';
    const md2 = 'Hello world';
    expect(countWords(md1)).toBe(countWords(md2));
  });

  it('handles multi-line markdown sections consistently', () => {
    const content = '## Intro\n\nThis is _italic_ and **bold** text.\n\n> A blockquote here.';
    const words = countWords(content);
    expect(words).toBeGreaterThan(0);
    expect(words).toBe(countWords(content));
  });
});

// ---- makeDebounced (auto-save trigger) ------------------------------------------

describe('makeDebounced', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not fire before the delay', () => {
    const fn = jest.fn();
    const d = makeDebounced(fn, 1500);
    d.schedule([]);
    jest.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('fires exactly once after the delay', () => {
    const fn = jest.fn();
    const d = makeDebounced(fn, 1500);
    d.schedule([]);
    jest.advanceTimersByTime(1500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on repeated calls (debounce behavior)', () => {
    const fn = jest.fn();
    const d = makeDebounced(fn, 1500);
    d.schedule([]);
    jest.advanceTimersByTime(800);
    d.schedule([]);
    jest.advanceTimersByTime(800);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(700);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel() prevents firing', () => {
    const fn = jest.fn();
    const d = makeDebounced(fn, 1500);
    d.schedule([]);
    d.cancel();
    jest.advanceTimersByTime(2000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('passes sections to the callback', () => {
    const fn = jest.fn();
    const sections: SectionData[] = [{ ordinal: 1, title: 'T', content: 'hello' }];
    const d = makeDebounced(fn, 500);
    d.schedule(sections);
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledWith(sections);
  });
});
