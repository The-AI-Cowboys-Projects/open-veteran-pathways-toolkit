# Open Veteran Pathways Toolkit

Open-source tools from The AI Cowboys Foundation, a Texas 501(c)(3) in San Antonio, for veterans, military families, and older adults.

The pages are static files. After they load, lookups, quizzes, and checklists run in the browser. There is no account, no analytics, and no call that sends what you type to a server. The Foundation is not part of the Department of Defense or the Department of Veterans Affairs. Nothing here is legal, medical, financial, benefits, or employment advice.

This repository is public so it can be reviewed. It does not report a grant award, a user count, or a partnership that is not in the git history.

## Tools

| Tool | What it does now | Offline data |
| --- | --- | --- |
| [Career Pathway Translator](career-pathway-translator/index.html) | Search an Army, Navy, Air Force, Marine Corps, Coast Guard, or Space Force code or title. Read the DMDC crosswalk, O*NET 31.0 title, description, skills, and sample civilian titles. Optional duty rewording and pay-grade scope language come from the Debriefed dictionary. | 26,883 military rows (13,513 active), 1,016 occupations. About 3.1 MiB. |
| [Scam Guardian](scam-guardian/index.html) | Paste a message, or read a screenshot with local OCR, and see which written scam rules matched. A small 2011 SMS model adds a separate hint. It does not detect deepfakes. | Rules plus a 10 KiB model. OCR runtime is about 14.2 MiB, loaded only with that page. |
| [Plain-English AI Tutor](ai-tutor/index.html) | 12 original lessons, 95 glossary entries, and 64 quiz questions with explanations. Each factual claim links a public source. Progress stays in this browser and can be exported. | Original text in the page. |
| [Transition Companion](transition-companion/index.html) | 32-step checklist from 24 months before separation through the first civilian year. Links the other tools and official public pages. A date highlights the closest window. | Checklist in the page. Checks live in `localStorage`. |

Each folder has its own `index.html` and can be copied into a site’s public directory. Paths between tools, styles, the manifest, and the service worker are relative, so the same files work on GitHub Pages and under a subpath such as `/learn/open-veteran-pathways/`. Keep the four folders and the repository root side by side if you want the installable offline copy. A single tool folder still runs its own page. The install button and the shared offline cache live with the full set of files.

## Run them

From the repository root:

```bash
python3 -m http.server 8765
```

Or `python3 scripts/serve.py`, which is the same kind of static server with threads so the offline cache can fetch many files at once.

Open `http://127.0.0.1:8765/`.

Pasted text, quizzes, and the checklist also work if you open the HTML file directly. Screenshot OCR, installation, and the offline cache do not. Browsers block the OCR worker from `file://`, and a service worker needs HTTP. Use the local server, GitHub Pages, or any other static host. The host does not receive what you type or the image. Tesseract runs in the page.

Check the logic without a browser, then the pages:

```bash
node scripts/verify.mjs
npm ci
npx playwright install chromium
npm test
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
- Checklist progress and tutor progress are only as durable as the browser. Export the JSON backup from the companion or the tutor if you need a copy.
- The offline cache stores the public files after the first visit. It does not store a classified network, and it does not make a shared computer private.
- Scam Guardian does not detect deepfakes. The tutor’s synthetic-media lesson says so, and it does not explain how to make one.

## Install and offline use

`manifest.webmanifest` and `sw.js` sit at the repository root. `start_url` and `scope` are `./`, resolved from wherever the files are served, including a project-site subpath and a folder such as `/learn/open-veteran-pathways/`. Icons are flat brand-color bars in teal `#3DD8C8` and magenta `#DD378A` on black. They are not a logo.

The service worker precaches each tool’s HTML, CSS, and scripts, the DMDC and O*NET files (`moc.js` and `occupations.js`), the naive Bayes model, and the Tesseract.js worker, LSTM cores, and English traineddata. The cache name is versioned. When a new version is installed, older caches are deleted. If a page is already open, it shows **Load the update** instead of swapping the running page by itself.

Chrome and Edge can show an **Install** button when the site is served over HTTPS or localhost. iPhone and iPad use Safari’s Share menu, then Add to Home Screen. The instructions are on every page. After one online visit, the tools open again with the network off.

## GitHub Pages

`.github/workflows/pages.yml` checks `node scripts/verify.mjs`, then publishes the repository root with GitHub Actions. The public site is [https://rogerthenomad.github.io/open-veteran-pathways-toolkit/](https://rogerthenomad.github.io/open-veteran-pathways-toolkit/). `.nojekyll` is present so Pages serves the files as they are.

## License

MIT for the Foundation’s code and original writing. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
