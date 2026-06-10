---
id: TASK-25
title: 'bug: "fork here" makes the page flicker'
status: Done
assignee: []
created_date: '2026-06-10 18:39'
updated_date: '2026-06-10 19:19'
labels: []
dependencies: []
modified_files:
  - src/components/ForkPanel.tsx
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
when you hover the "fork here" a border is drawn with a blue background. but this shift a little the page, so it unhovers the button. Then the border is gone, the position is restored and then you are hover again. This loops and flickers the page
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Summary
Fixed flicker loop on "Fork from here" hover.

Root cause: `ForkPanel.tsx` only added `px-4 py-2 -mx-4` (layout-affecting padding/margin) when a section was hovered/highlighted. The added `py-2` shifted the section's content down, moving the fork button out from under the cursor -> `mouseleave` -> classes removed -> button jumps back under cursor -> `mouseenter` -> repeat, causing a continuous flicker.

Fix: made `px-4 py-2 -mx-4 rounded-xl` part of the section's permanent classes (constant box size), and only toggle the purely visual `bg-sky-blue-50 ring-1 ring-sky-blue-200` on hover — `ring` is a box-shadow and doesn't affect layout, so hovering no longer shifts the page.

## Tests
- `npm test` — 253/253 passing
- `npx tsc --noEmit` clean
<!-- SECTION:FINAL_SUMMARY:END -->
