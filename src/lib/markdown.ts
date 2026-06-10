import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i', 's', 'del', 'code', 'pre',
  'blockquote',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title'],
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/**
 * Renders user-supplied markdown to HTML and strips anything that isn't
 * plain prose markup (scripts, event handlers, iframes, javascript: URLs, etc.)
 * before it is sent to the browser via dangerouslySetInnerHTML.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown ?? '');
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowProtocolRelative: false,
  });
}
