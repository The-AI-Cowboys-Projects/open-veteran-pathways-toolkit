# Toolkit components

Each directory is a static site of its own. Copy a folder into a website’s public files, or serve this repository root.

- `career-pathway-translator/` uses the DMDC crosswalk, a subset of the O*NET 31.0 Database (CC BY 4.0), BLS handbook URLs, and phrasing from Debriefed (MIT, Chris Simser).
- `scam-guardian/` uses original rules, a model derived from the SMS Spam Collection, and vendored Tesseract.js (Apache-2.0). It does not include Scram or Gemma. It does not detect deepfakes.
- `ai-tutor/` is original glossary, lesson, and quiz text.
- `transition-companion/` is an original checklist with links to the other tools and to public VA, DoD, DOL, SBA, FTC, and IC3 pages.

Shared colors and layout live in `shared/styles.css` and are copied into each tool as `styles.css` so a single folder still looks the same.
