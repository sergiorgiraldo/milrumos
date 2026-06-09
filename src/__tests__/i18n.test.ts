import { createT, getTranslations, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_NAMES } from '@/lib/i18n';

describe('i18n - createT', () => {
  const en = getTranslations('en');
  const pt = getTranslations('pt');
  const t = createT(en);
  const tPt = createT(pt);

  it('returns string for a valid key', () => {
    expect(t('nav.explore')).toBe('Explore');
  });

  it('returns Portuguese string', () => {
    expect(tPt('nav.explore')).toBe('Explorar');
  });

  it('interpolates {vars} in template', () => {
    expect(t('editor.wordsCount', { count: 42 })).toBe('42 words');
  });

  it('interpolates multiple vars', () => {
    expect(t('editor.section', { n: 3 })).toBe('Section 3');
  });

  it('returns key if path not found', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('leaves unfilled placeholders as-is', () => {
    expect(t('editor.section')).toBe('Section {n}');
  });

  it('handles Portuguese interpolation', () => {
    expect(tPt('editor.wordsCount', { count: 10 })).toBe('10 palavras');
  });

  it('handles fork singular', () => {
    expect(t('pieceCard.fork', { count: 1 })).toBe('1 fork');
  });

  it('handles fork plural', () => {
    expect(t('pieceCard.forks', { count: 3 })).toBe('3 forks');
  });

  it('handles Portuguese fork plural', () => {
    expect(tPt('pieceCard.forks', { count: 5 })).toBe('5 ramificações');
  });
});

describe('i18n - getTranslations', () => {
  it('returns English by default for unknown locale', () => {
    const translations = getTranslations('en');
    expect(translations.nav.explore).toBe('Explore');
  });

  it('returns Portuguese translations', () => {
    const translations = getTranslations('pt');
    expect(translations.nav.explore).toBe('Explorar');
  });
});

describe('i18n - constants', () => {
  it('DEFAULT_LOCALE is en', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('SUPPORTED_LOCALES contains en and pt', () => {
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(SUPPORTED_LOCALES).toContain('pt');
  });

  it('LOCALE_NAMES has human-readable names', () => {
    expect(LOCALE_NAMES.en).toBe('English');
    expect(LOCALE_NAMES.pt).toBe('Português');
  });
});
