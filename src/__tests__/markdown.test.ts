// `marked` ships ESM-only and is exercised end-to-end by Next.js at build/runtime.
// Here we mock it as an identity pass-through so the test focuses on the
// sanitize-html wrapper that protects dangerouslySetInnerHTML from XSS.
jest.mock('marked', () => ({
  marked: { parse: jest.fn(async (html: string) => html) },
}));

import { renderMarkdown } from '@/lib/markdown';

describe('renderMarkdown', () => {
  it('preserves standard prose markup', async () => {
    const html = await renderMarkdown('<h1>Title</h1><p>Some <strong>bold</strong> and <em>italic</em> text.</p>');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('preserves safe links and images', async () => {
    const html = await renderMarkdown(
      '<a href="https://example.com">link</a> <img src="https://example.com/a.png" alt="alt">'
    );
    expect(html).toContain('<a href="https://example.com">link</a>');
    expect(html).toContain('<img src="https://example.com/a.png" alt="alt"');
  });

  it('strips script tags', async () => {
    const html = await renderMarkdown('Hello <script>alert(document.cookie)</script> world');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(document.cookie)');
  });

  it('strips event handler attributes', async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('strips javascript: URLs from links', async () => {
    const html = await renderMarkdown('<a href="javascript:alert(1)">click me</a>');
    expect(html).not.toContain('javascript:');
  });

  it('strips iframe and other unsafe tags', async () => {
    const html = await renderMarkdown('<iframe src="https://evil.com"></iframe>');
    expect(html).not.toContain('<iframe');
  });

  it('strips protocol-relative image sources', async () => {
    const html = await renderMarkdown('<img src="//evil.com/track.png" alt="x">');
    expect(html).not.toContain('//evil.com');
  });
});
