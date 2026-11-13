# Contributing

Thanks for improving a tool that people may trust with a career story or a scary message. Keep changes easy to review.

## Ground rules

- The pages stay private by default. Do not add analytics, ad pixels, remote fonts, or a call that sends typed text or screenshots off the device.
- Runtime code should keep working from the files in the repo. A link the user chooses to open is fine. The only runtime download is the optional Gemma model, and only after the person confirms it. Do not precache those weights.
- Do not add classified examples, real Social Security numbers, medical notes, or other people’s personal messages.
- New third-party text or data needs a license that allows redistribution with this MIT repository. Put the notice in `THIRD_PARTY_NOTICES.md` and, when the upstream license requires a file, under that tool’s `vendor/` folder. If the license is missing or incompatible, do not copy the material. Say what you rejected in `docs/RESEARCH.md`.
- Do not relicense O*NET, DMDC, BLS, or the SMS Spam Collection as MIT.
- O*NET text must keep the CC BY 4.0 credit and the statement that USDOL/ETA has not approved modifications. O*NET® stays a trademark used as an adjective.
- Write claims the way you can demonstrate them. Do not add user counts, grant awards, or partnerships.
- Prefer a focused change. Use a conventional commit such as `feat:`, `fix:`, `docs:`, `refactor:`, or `test:`.

## Checks

```bash
node scripts/verify.mjs
```

That script checks known military codes, scam fixtures, glossary and quiz shape, source links on tutor claims, checklist ids, local CSS, the manifest, the offline file list, and the absence of remote fetches in the page scripts.

Browser checks, including a 360px viewport and a reload with the network off:

```bash
npm ci
npx playwright install chromium
npx playwright test
```

If you change what a person sees, also open the page with a local static server and use the control you changed. Screenshot OCR, installation, and the service worker need that server. Pasted text can be checked from `file://` as well.

## Refreshing data

Career files:

```bash
python3 scripts/build_career_data.py
```

The script downloads the DMDC zip, O*NET 31.0 CSVs, the BLS handbook crosswalk, and Debriefed’s public-data JSON at the commit named in the script. Read the diff before you commit it. Update the counts in `README.md` if they move.

SMS model:

```bash
python3 scripts/build_scam_model.py
```

Commit the model file, not the raw SMS corpus. Record the new holdout precision and recall in the README and in `docs/RESEARCH.md`. If precision at the chosen cutoff is poor, raise the cutoff or stop showing the hint. Do not let the model override the written rules.

OCR files:

```bash
bash scripts/vendor_tesseract.sh
```

Keep the Apache notices with the files.

## Accessibility

Keep labels on fields, a visible focus style, keyboard access, and the Larger text control. Black text on the magenta `#DD378A` and teal `#3DD8C8` brand colors is there so the contrast stays readable. Do not put white text on those colors for small type.

## Security reports

Do not file a public issue that includes a working exploit against a person. Describe the page and the behavior. These tools are static files. There is no account to reset.
