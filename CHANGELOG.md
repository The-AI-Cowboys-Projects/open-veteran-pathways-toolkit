# Changelog

## Unreleased

### Added

- Career Pathway Translator free-text mode using 8,361 Debriefed dictionary rows. Debriefed’s manifest reports 34,071 rows; the 24,248-row crosswalk file is not shipped.
- Scam Guardian rubric and prompts adapted from Scram, plus an optional on-device Gemma 3 270M model that is not required and is not precached.
- Tutor passage search and the same optional model, limited to the tutor’s own sourced text. Least-agency notes for the tutor and the companion, citing Pendleton, M., et al. (2026).
- SECURITY.md, CODE_OF_CONDUCT.md, issue and pull request templates, and an offline zip workflow.

### Added earlier in this unreleased line

- Shared mobile-first layout for the landing page and all four tools: 44px targets, light and dark themes, visible focus, and reduced-motion support. The wordmark appears once, in the header.
- Empty, loading, and error states, including a labeled OCR progress bar in Scam Guardian.
- Installable web app manifest with relative `start_url` and `scope`, brand-color icons, and an Install button where the browser supports it. iPhone and iPad instructions use Add to Home Screen.
- Versioned service worker that precaches every tool, the DMDC and O*NET files, the SMS model, and the local Tesseract worker, cores, and English traineddata. Older caches are deleted on activate. An open page can load the update when a new cache is waiting.
- Plain-English AI Tutor expansion: 12 lessons, 95 glossary entries, and 64 quiz questions. Answers include explanations and a public source link. Progress stays in `localStorage`, including a best score, and can be downloaded as JSON.
- Unit checks for the new counts, sources, manifest, and precache list. Playwright covers the four tools, a 360px viewport, offline reload, and a nested subpath.

### Changed

- Tool pages link the shared shell for text size, theme, and the service worker. A copied single folder still runs if that shell is absent. Larger text remains on the tool page in that case.
- GitHub Pages workflow runs the local verify script before it uploads the site.

## 2026-11-13

- Career Pathway Translator, Scam Guardian, Plain-English AI Tutor, and Transition Companion, plus the GitHub Pages workflow, as merged in the first public revision.
