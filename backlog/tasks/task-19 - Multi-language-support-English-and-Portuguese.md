---
id: TASK-19
title: 'Multi-language support: English and Portuguese'
status: In Progress
assignee: []
created_date: '2026-06-09 07:26'
labels: []
dependencies: []
priority: high
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement i18n with EN + PT. Translation tables in JSON files. Extensible for future languages. User can switch at runtime via UI selector.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All UI text comes from locale JSON files
- [ ] #2 English and Portuguese fully translated
- [ ] #3 Language switcher in navbar persists choice across reloads
- [ ] #4 Adding a new language requires only a new JSON file + one config line
- [ ] #5 Unit tests for t() interpolation and context
<!-- AC:END -->
