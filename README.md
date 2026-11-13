# Open Veteran Pathways Toolkit

Open-source tools from The AI Cowboys Foundation, a Texas 501(c)(3) in San Antonio, for veterans, military families, and older adults.

The pages are static files. After they load, lookups, quizzes, and checklists run in the browser. There is no account, no analytics, and no call that sends what you type to a server. The Foundation is not part of the Department of Defense or the Department of Veterans Affairs. Nothing here is legal, medical, financial, benefits, or employment advice.

This repository is public so it can be reviewed. It does not report a grant award, a user count, or a partnership that is not in the git history.

## Tools

| Tool | What it does now | Offline data |
| --- | --- | --- |
| [Career Pathway Translator](career-pathway-translator/index.html) | Search an Army, Navy, Air Force, Marine Corps, Coast Guard, or Space Force code or title. Read the DMDC crosswalk, O*NET 31.0 title, description, skills, and sample civilian titles. Optional duty rewording and pay-grade scope language come from the Debriefed dictionary. | 26,883 military rows (13,513 active), 1,016 occupations. About 3.1 MiB. |
| [Scam Guardian](scam-guardian/index.html) | Paste a message, or read a screenshot with local OCR, and see which written scam rules matched. A small 2011 SMS model adds a separate hint. It does not detect deepfakes. | Rules plus a 10 KiB model. OCR runtime is about 14.2 MiB, loaded only with that page. |
| [Plain-English AI Tutor](ai-tutor/index.html) | 36 glossary entries, 6 original lessons, and 19 quiz questions. Progress stays in this browser. | About 40 KiB of original text. |
| [Transition Companion](transition-companion/index.html) | 32-step checklist from 24 months before separation through the first civilian year. Links the other tools and official public pages. A date highlights the closest window. | Checklist in the page. Checks live in `localStorage`. |

Each folder has its own `index.html` and can be copied into a site’s `/public` directory. Paths between tools use `../`, so keep the four folders side by side if you want those links. A single folder still works on its own.

## Run them

From the repository root:

```bash
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`.

Pasted text, quizzes, and the checklist also work if you open the HTML file directly. Screenshot OCR does not. Browsers block the OCR worker from `file://`. Use the local server, GitHub Pages, or any other static host for screenshots. The host does not receive the image. Tesseract runs in the page.

Check the logic without a browser:

```bash
node scripts/verify.mjs
```

Rebuild career data or the SMS model only if you intend to refresh upstream files. The scripts download public files and write the JavaScript the pages already include:

```bash
python3 scripts/build_career_data.py
python3 scripts/build_scam_model.py
bash scripts/vendor_tesseract.sh
```

## Sources and licenses

Our code is [MIT](LICENSE). Other material keeps its own license. Details, including what was rejected, are in [docs/RESEARCH.md](docs/RESEARCH.md). Notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

- Military codes: Defense Manpower Data Center crosswalk `milx0724` (July 2024), a U.S. government work distributed from the [O*NET crosswalk page](https://www.onetcenter.org/crosswalks.html). It is not part of the O*NET CC BY license.
- Occupation text: [O*NET 31.0 Database](https://www.onetcenter.org/license_db.html) by the U.S. Department of Labor, Employment and Training Administration, CC BY 4.0. This project shortened it. USDOL/ETA has not approved, endorsed, or tested the changes. O*NET® is a trademark of USDOL/ETA.
- Handbook links: Bureau of Labor Statistics Occupational Outlook Handbook crosswalk. The handbook’s articles are not copied.
- Resume phrasing and curated code notes: [Debriefed](https://github.com/csimser/debriefed) by Chris Simser, MIT, commit `7d75063a4d816ab615cdfbe8868045490837f725`.
- Scam rules: original text informed by public VA, VA OIG, FTC, and FBI pages. Those pages are linked, not copied.
- SMS hint: a model derived from the SMS Spam Collection v.1 (Almeida and Gómez Hidalgo). The messages themselves are not in the repo. On a 1,032-message holdout, a 90% cutoff had precision 0.8782 and recall 0.9856. That collection is not veteran-benefits mail.
- OCR: Tesseract.js 7.0.0 and tesseract.js-core 7.0.0, Apache-2.0. The screenshot flow follows the offline idea in [Scram](https://github.com/erfunm/Scram) by Erfan Mirhosseini (MIT). Scram’s Android code and Google’s Gemma model are not included. Gemma’s terms are not MIT, and the model is multi-gigabyte.
- Tutor and checklist wording: original to this repository.

## Honest limits

- A crosswalk match is not a job offer, a license, or a VA decision. Infantry and some other codes point at military O*NET occupations (group 55). The page labels those.
- Debriefed’s civilian titles are suggestions from that dictionary. Four of its O*NET codes are older than the 31.0 file used here.
- Skill identifiers, prefixes, and Navy additional qualification designators are not in the career file.
- Scam Guardian is an aid. A low score is not a clearance. It does not judge pictures of faces, voices, or video.
- OCR misreads blurry screenshots. Correct the text before you rely on it.
- Checklist progress is only as durable as the browser. Export the JSON backup from the companion if you need a copy.

## GitHub Pages

`.github/workflows/pages.yml` publishes the repository root with GitHub Actions. A repository admin still has to set Settings → Pages → Source to GitHub Actions. Until that is set, the workflow cannot deploy.

## License

MIT for the Foundation’s code and original writing. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
