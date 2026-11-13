# Toolkit components

**Built by The AI Cowboys.** The AI Cowboys Foundation, [www.theaicowboysfoundation.org](https://www.theaicowboysfoundation.org), a veteran-owned AI lab in San Antonio.

Each directory is a static site of its own. Copy a folder into a website’s public files, or serve this repository root.

- `career-pathway-translator/` uses the DMDC crosswalk, a subset of the O*NET 31.0 Database (CC BY 4.0), BLS handbook URLs, and a military-to-civilian phrase dictionary.
- `scam-guardian/` uses original rules, a model derived from the SMS Spam Collection, a point rubric, and vendored Tesseract.js (Apache-2.0). The optional Gemma model is not in the repository. It does not detect deepfakes.
- `ai-tutor/` is original glossary, lesson, and quiz text.
- `transition-companion/` is an original checklist with links to the other tools and to public VA, DoD, DOL, SBA, FTC, and IC3 pages.

Shared colors and layout live in `shared/styles.css` and are copied into each tool as `styles.css` so a single folder still looks the same.
