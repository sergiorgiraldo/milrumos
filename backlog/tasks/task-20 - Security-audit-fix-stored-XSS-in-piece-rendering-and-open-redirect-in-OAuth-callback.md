---
id: TASK-20
title: >-
  Security audit: fix stored XSS in piece rendering and open redirect in OAuth
  callback
status: Done
assignee: []
created_date: '2026-06-10 10:07'
updated_date: '2026-06-10 10:07'
labels:
  - security
dependencies: []
modified_files:
  - src/lib/markdown.ts
  - 'src/app/pieces/[id]/page.tsx'
  - src/lib/auth.ts
  - src/app/auth/callback/route.ts
  - src/__tests__/markdown.test.ts
  - src/__tests__/auth.test.ts
  - package.json
  - package-lock.json
priority: high
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit identified two vulnerabilities in the writer collaboration site:

1. **Stored XSS** (`src/app/pieces/[id]/page.tsx`): section markdown was converted via `marked.parse()` and injected with `dangerouslySetInnerHTML` in `ForkPanel` with no sanitization. Since `marked` passes raw HTML through, any author could embed `<script>`/`onerror=`/`<iframe>` etc. in a published piece, executing in every viewer's session (other writers, forkers, anyone who can read a published piece).

2. **Open redirect** (`src/app/auth/callback/route.ts`): the `next` query param was concatenated unsanitized into `${origin}${next}` for the post-login redirect. A crafted `next` value such as `@evil.com` turns the result into `http://site.com@evil.com`, where `evil.com` is parsed as the host — a classic OAuth-callback open redirect usable for phishing right after a trusted login flow.

Both have been fixed and covered by unit tests.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Markdown rendered for piece sections is sanitized before being injected via dangerouslySetInnerHTML, stripping <script>, event-handler attributes, javascript: URLs, and <iframe>, while preserving normal prose markup (headings, emphasis, lists, links, images, tables)
- [x] #2 The OAuth callback's `next` redirect target is restricted to same-site relative paths, rejecting absolute URLs, protocol-relative paths, and userinfo (`@host`) tricks
- [x] #3 Unit tests cover the sanitization wrapper and the redirect-path validator, including malicious payload cases
- [x] #4 Full test suite, lint, typecheck, and production build pass with no new warnings
<!-- AC:END -->



## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## What changed

- **New `src/lib/markdown.ts`**: `renderMarkdown()` wraps `marked.parse()` with `sanitize-html`, allowing only prose tags (headings, p, lists, emphasis, code, blockquote, tables, a, img, etc.) with safe attributes/schemes (http/https/mailto only, no protocol-relative URLs).
- **`src/app/pieces/[id]/page.tsx`**: now calls `renderMarkdown(s.content)` instead of raw `marked.parse(s.content)` before handing HTML to `ForkPanel`'s `dangerouslySetInnerHTML`.
- **`src/lib/auth.ts`**: added `sanitizeRedirectPath()` — only allows paths starting with a single `/` (rejects absolute URLs, `//host`, and `@host` userinfo-confusion payloads), defaulting to `/`.
- **`src/app/auth/callback/route.ts`**: now sanitizes the `next` query param via `sanitizeRedirectPath()` before building the post-login redirect URL.
- Added `sanitize-html` + `@types/sanitize-html` as dependencies.

## Tests

- `src/__tests__/markdown.test.ts` (new): verifies prose markup, links/images pass through; `<script>`, `onerror=`, `javascript:` links, `<iframe>`, and protocol-relative `img src` are stripped. `marked` is mocked as identity since it's ESM-only and not jest-transformable; the test targets the sanitize-html wrapper which is the actual security boundary.
- `src/__tests__/auth.test.ts`: added `sanitizeRedirectPath` cases for relative paths (allowed) vs absolute URLs, `//evil.com`, and `@evil.com` (all fall back to `/`).
- Full suite: 16 suites / 238 tests pass. `tsc --noEmit`, `eslint` on changed files, and `next build` all pass clean (one pre-existing unrelated `<img>` lint warning in the same page).

## Notes / out of scope

- `npm audit` reports a moderate transitive `postcss` advisory via Next's bundled dependency; fixing it requires a major Next.js downgrade (breaking), so left as-is.
<!-- SECTION:FINAL_SUMMARY:END -->
