# Open Veteran Pathways Toolkit

**Built by The AI Cowboys**

The AI Cowboys Foundation, [www.theaicowboysfoundation.org](https://www.theaicowboysfoundation.org), a veteran-owned AI lab in San Antonio. The Foundation is a Texas 501(c)(3).

Open-source tools for veterans, military families, and older adults.

The pages are static files. After they load, lookups, quizzes, and checklists run in the browser. There is no account, no analytics, and no call that sends what you type to a server. The Foundation is not part of the Department of Defense or the Department of Veterans Affairs. Nothing here is legal, medical, financial, benefits, or employment advice.

This repository is public so it can be reviewed. It does not report a grant award, a user count, or a partnership that is not in the git history.

## Tools

| Tool | What it does now | Offline data |
| --- | --- | --- |
| [Career Pathway Translator](career-pathway-translator/index.html) | Search an Army, Navy, Air Force, Marine Corps, Coast Guard, or Space Force code or title. Read the DMDC crosswalk, O*NET 31.0 title, description, skills, and sample civilian titles. A separate box translates pasted bullets with the military-to-civilian phrase dictionary. | 26,883 military rows (13,513 active), 1,016 occupations, 8,361 phrase-dictionary rows. |
| [Scam Guardian](scam-guardian/index.html) | Paste a message, or read a screenshot with local OCR, and see which written scam rules matched. A second point rubric is another reading. An optional Gemma model can be downloaded later. It does not detect deepfakes. | 14 rules plus a 10 KiB SMS model. OCR runtime is about 14.2 MiB. The optional model is not in the repository. |
| [Plain-English AI Tutor](ai-tutor/index.html) | 12 original lessons, 95 glossary entries, and 64 quiz questions with explanations. A question box shows matching passages from those lessons. An optional on-device model can phrase an answer only from those passages. | Original text in the page. |
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

## Screenshots

Free-text translation uses the dictionary stored with the page. The MOS to CEO Translator link leaves this repository.

![Translating a résumé line on this device](docs/screenshots/career-free-text.png)

The optional model states its size and the Gemma terms before any download. The rules still run when it is absent.

![Scam Guardian with the model not downloaded](docs/screenshots/scam-model-absent.png)

A tutor question shows passages from the lessons, with the source link, before any model wording.

![Tutor passages for a phishing question](docs/screenshots/tutor-sourced-passages.png)

The companion tells the person that checking a box is their action.

![Transition Companion oversight notice](docs/screenshots/companion-oversight.png)

## Honest limits

- A crosswalk match is not a job offer, a license, or a VA decision. Infantry and some other codes point at military O*NET occupations (group 55). The page labels those.
- Civilian titles in the phrase dictionary are wording suggestions. Four O*NET codes in those notes are older than the 31.0 file used here.
- Skill identifiers, prefixes, and Navy additional qualification designators are not in the career file.
- Scam Guardian is an aid. A low score is not a clearance. It does not judge pictures of faces, voices, or video.
- OCR misreads blurry screenshots. Correct the text before you rely on it.
- Checklist progress and tutor progress are only as durable as the browser. Export the JSON backup from the companion or the tutor if you need a copy.
- The offline cache stores the public files after the first visit. It does not store a classified network, and it does not make a shared computer private.
- Scam Guardian does not detect deepfakes. The tutor’s synthetic-media lesson says so, and it does not explain how to make one.
- The optional Gemma model was not scored on veteran-benefits messages in this repository. A label it returns is not a measured probability. The written rules do not change because of it.
- The phrase dictionary shipped here is 8,361 rows. It is not the military crosswalk.

## Install and offline use

`manifest.webmanifest` and `sw.js` sit at the repository root. `start_url` and `scope` are `./`, resolved from wherever the files are served, including a project-site subpath and a folder such as `/learn/open-veteran-pathways/`. Icons are flat brand-color bars in teal `#3DD8C8` and magenta `#DD378A` on black. They are not a logo.

The service worker precaches each tool’s HTML, CSS, and scripts, the DMDC and O*NET files (`moc.js` and `occupations.js`), the naive Bayes model, and the Tesseract.js worker, LSTM cores, and English traineddata. The cache name is versioned. When a new version is installed, older caches are deleted. If a page is already open, it shows **Load the update** instead of swapping the running page by itself.

Chrome and Edge can show an **Install** button when the site is served over HTTPS or localhost. iPhone and iPad use Safari’s Share menu, then Add to Home Screen. The instructions are on every page. After one online visit, the tools open again with the network off.

## GitHub Pages

`.github/workflows/pages.yml` checks `node scripts/verify.mjs`, then publishes the repository root with GitHub Actions. The public site is [https://the-ai-cowboys-projects.github.io/open-veteran-pathways-toolkit/](https://the-ai-cowboys-projects.github.io/open-veteran-pathways-toolkit/). `.nojekyll` is present so Pages serves the files as they are.

## Download a copy

`python3 scripts/package_offline_zip.py` writes `dist/open-veteran-pathways-toolkit-offline.zip`. Unpack it and serve the folder with any static server. Opening the HTML files directly still runs pasted text, quizzes, and the checklist. OCR, installation, and the service worker need HTTP. The optional model weights are not in the zip. The browser runtime that can load them is. `THIRD_PARTY_LICENSES.md` is in the zip.

`.github/workflows/release-zip.yml` builds that zip on demand and attaches it to a GitHub release when a tag named `v*` is pushed.

## Docs

The notes in [docs/README.md](docs/README.md) index the research record and the agent-security note.

## License

MIT for the Foundation’s code and original writing. See [LICENSE](LICENSE).

Third-party license notices: see THIRD_PARTY_LICENSES.md.
