# Research notes

Prepared for the Open Veteran Pathways Toolkit, an open-source project of The AI Cowboys Foundation (a Texas 501(c)(3) in San Antonio). The notes record what was checked, what was used, and what was left out. They are not a claim that a grant was awarded and not a claim of affiliation with any government agency.

Checked on 13 November 2026 from public pages and from the files those pages link to.

## How license decisions were made

The repository is MIT licensed. MIT code can sit next to other material only when that material’s own license allows redistribution and the original notice stays with it. Government works of the United States are not copyrighted under 17 U.S.C. § 105, but a file hosted on a government site can still include third-party material or a separate contract term. If a license could not be confirmed, the file was not copied.

## Career Pathway Translator

### Used: DMDC Military Occupational Classification crosswalk

- Page: [O*NET Resource Center crosswalk files](https://www.onetcenter.org/crosswalks.html)
- File: [military_crosswalk.zip](https://www.onetcenter.org/dl_files/2019/military_crosswalk.zip), inner file `milx0724.csv`, Read Me dated with the July 2024 contents
- Source line in the Read Me: “Source: Defense Manpower Data Center”
- [data.gov catalog record](https://catalog.data.gov/dataset/military-to-civilian-crosswalk) lists the military-to-civilian crosswalk as public access
- [CareerOneStop’s MOC API description](https://www.careeronestop.org/Developers/WebAPI/MilitaryOccupations/list-moc-by-onet.aspx) says the data was developed and maintained by the Department of Defense and provided for public use
- O*NET OnLine’s [external data sources](https://www.onetonline.org/help/online/datasources) page says the military crosswalk is external data and is **not** covered by the O*NET content license. That warning is why this toolkit does not treat the file as CC BY. It is kept as a U.S. government work from DMDC, with the field definitions from the zip’s Read Me
- What shipped: 26,883 rows for primary enlisted, warrant, and officer codes in Army (SVC A), Navy (N, P, S), Air Force (F), Marine Corps (M), Coast Guard (C), and Space Force (H, O), including obsolete rows. 13,513 are active. 19,729 have at least one O*NET-SOC code. Add-on identifiers (ASI, SQI, prefixes, SEIs, AQDs) were left out to keep the lookup about occupations rather than every qualifier
- Known limit: some official links are military O*NET occupations, especially `55-3016.00` Infantry for Army 11B and Marine Corps 0311. The page says so. It does not pretend those are civilian job offers

### Used: O*NET 31.0 Database (subset)

- License: [O*NET 31.0 Database Content License](https://www.onetcenter.org/license_db.html), Creative Commons Attribution 4.0
- Files used, from the CSV directory linked on the [database page](https://www.onetcenter.org/database.html):
  - `occupation_data.csv` (1,016 occupations: code, title, description)
  - `essential_skills.csv` (importance scale only, top six skill names)
  - `sample_of_reported_titles.csv` (up to six reported titles)
  - `job_zones.csv` and `job_zone_reference.csv` (the official zone name and education sentence)
- The database’s current production release at the time of the download was 31.0 (August 2026 on the [releases archive](https://www.onetcenter.org/db_releases.html))
- Modification: columns for sample size, standard error, dates, and suppression flags were dropped after skipping any importance row marked Recommend Suppress or Not Relevant. In the 31.0 essential-skills importance rows that were read, those flags were not set, so no skill row was removed for that reason. USDOL/ETA has not approved, endorsed, or tested the subset
- Required credit, also shown in the tool: “This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET® is a trademark of USDOL/ETA. The AI Cowboys Foundation has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.”
- The license asks developers to complete an optional registration form. That form was not submitted from this build. The Foundation can register later if it wants to. Registration is not a condition of the CC BY license
- 703 occupations in the subset have a BLS handbook URL. 910 have a skill list. Job-zone labels in this release use zones 2 through 5. Zone 2 is named, in the official reference file, “Job Zone 1-2: Very Little to Some Preparation Needed”

### Used: BLS Occupational Outlook Handbook crosswalk (URLs only)

- Page: [Crosswalk files, Occupational Outlook Handbook section](https://www.onetcenter.org/crosswalks.html), which states the crosswalk is developed and maintained by the Bureau of Labor Statistics
- File: [Occupation_Handbook_to_ONET-SOC.xlsx](https://www.onetcenter.org/crosswalks/ooh/Occupation_Handbook_to_ONET-SOC.xlsx) (October 2026 update noted on that page)
- What shipped: the handbook profile URL for an O*NET-SOC code, when the crosswalk had one. Handbook prose was not copied. BLS works are U.S. government works. The link is opened only if the user chooses it

### Used: Debriefed dictionary (MIT), phrasing and curated notes

- Repository: [github.com/csimser/debriefed](https://github.com/csimser/debriefed)
- License file: MIT, Copyright (c) 2026 Chris Simser
- Commit used: `7d75063a4d816ab615cdfbe8868045490837f725`
- Manifest version in that tree: `2026-05-20.83b39983`, described by the project as a 33,000-plus row dictionary across many tables
- What shipped, as a derivative kept under the MIT notice in `career-pathway-translator/vendor/debriefed/`:
  - 493 curated code notes (`mos_to_civilian.json`) with civilian titles and skills the author recorded
  - 1,124 phrase translations, 745 evaluation phrases, 1,278 jargon entries of four or more characters, 1,149 acronyms, 57 rank rows, 22 soft-skill lines, strong action verbs in 17 categories, and 845 resume-bullet examples
- What was not needed for this tool and was not copied: cover-letter templates, LinkedIn templates, funding tables, and the app’s server code
- Four O*NET codes in the curated notes are not in the O*NET 31.0 occupation file used here: `27-3012.00`, `29-2041.00`, `31-1014.00`, `53-1047.00`. The page says when a code is missing. For 68W, the DMDC file points at current `29-2043.00` Paramedics, which is the official link shown first
- Debriefed’s own `onet_crosswalk.json` (24,248 rows) was not used as the military source. The DMDC CSV is the upstream file and includes status, personnel category, and up to four O*NET codes. Debriefed’s MIT license would have allowed copying their JSON, but it would have been a second-hand extract

### Rejected for the career tool

| Source | Why it was not copied |
| --- | --- |
| [RAND Army KSA crosswalk](https://www.rand.org/pubs/research_reports/RR1719.html), also linked as an xlsx from the O*NET crosswalk page | RAND reports are RAND’s copyrighted work. No redistribution license was found that clearly allows shipping the spreadsheet inside an MIT repo |
| [DoD COOL supplemental xlsx](https://www.onetcenter.org/dl_files/2019/cool_supplemental_data.xlsx) | O*NET says COOL links are external and not under the database license. The COOL sites themselves were not readable from this build environment (the connection to `cool.osd.mil` failed). Linking to [cool.osd.mil](https://www.cool.osd.mil/) is fine. Copying the spreadsheet was not |
| [ASVAB / Careers in the Military supplemental xlsx](https://www.onetcenter.org/dl_files/2019/citm_supplemental_data.xlsx) | Same external-data warning. Careers in the Military is a companion commercial-style site. License unknown |
| [VOW to Hire Heroes enhanced analysis xls](https://www.onetcenter.org/dl_files/ncsc/vow222.xls) | A DOL-commissioned study. The download page does not put it under the CC BY database license. The spreadsheet was not opened for reuse because the redistribution terms were not clear |
| My Next Move for Veterans page text | [Separate site license](https://www.onetcenter.org/license_agreements.html). The toolkit links to [mynextmove.org/vets](https://www.mynextmove.org/vets/) and does not copy the site |
| O*NET Web Services API | Would be a network call at runtime and would require a key. The offline file replaces that for this tool |
| Full O*NET task statements, work context, and abilities | Accurate, CC BY, and large. Skills plus the occupation description were enough for a readable offline page. They can be added later under the same license |

## Scam Guardian

### Used: original rules grounded in public typology pages

The rules were written for this toolkit. They are not a copy of a government article. Each rule stores a short original explanation and a link to a public page that documents the tactic. The page does not fetch those sites during analysis.

Pages used as the factual basis:

- [VA benefits fraud prevention](https://benefits.va.gov/BENEFITS/fraud-prevention.asp), including pension poaching, fees, and asset transfers
- [VA pension](https://www.va.gov/pension/)
- [VA accreditation FAQ](https://www.va.gov/ogc/accred_faqs.asp), for the “guaranteed claim” fee pattern
- [VA OIG crime alerts](https://www.vaoig.gov/crime-alerts-and-fraud-resources) and the [VA OIG home page](https://www.vaoig.gov/)
- [FTC ReportFraud](https://reportfraud.ftc.gov/)
- [FBI IC3](https://www.ic3.gov/)
- FBI field-office descriptions of veteran-targeted loan, impostor, and pension schemes, for example the [Phoenix field office note](https://www.fbi.gov/contact-us/field-offices/phoenix/news/press-releases/fbi-tech-thursday-scams-targeting-veterans). Those pages are public government statements. Their sentences were not pasted into the tool

Patterns covered: benefits impersonation, threats to suspend benefits, requests for identity or banking secrets, gift-card / wire / crypto payment, pension poaching, claim fees and guaranteed ratings, romance or deployed-stranger requests, lookalike and shortened links, prizes, family-emergency or bail requests, remote-access tech support, pressured charity appeals, VA loan refinance pressure, and urgency or secrecy. A mention of “VA” alone does not raise the score. A clinic appointment reminder is a test case and stays at low concern with no rule hits.

### Used: SMS Spam Collection v.1, as a small model only

- Paper: Almeida, T.A., Gómez Hidalgo, J.M., Yamakami, A. “Contributions to the Study of SMS Spam Filtering: New Collection and Results.” Proceedings of the 2011 ACM Symposium on Document Engineering (DOCENG’11)
- Download used: [UCI archive zip](https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip)
- License, from the collection readme: copyright Tiago Agostinho de Almeida and José María Gómez Hidalgo. The corpus may be used, modified, and redistributed with no warranty. A citation is requested. The full notice is in `THIRD_PARTY_NOTICES.md`
- What shipped: 617 word log-odds from a binary naive Bayes model trained on 80% of 5,160 deduplicated messages (seed 20261113; 503 spam and 3,625 ham in the training slice). The raw messages were not committed. Many ham messages are personal, and many spam messages contain phone numbers
- Holdout (1,032 messages), at probability 0.90: precision 0.8782, recall 0.9856, 19 false positives, 2 false negatives. At 0.50, precision fell to 0.6832, so the page only mentions the model when it clears 0.90. The model does not change the rule level
- This collection is British and Singaporean SMS from about 2011. It is a weak hint for VA pension fraud. The page says that

### Used: Tesseract.js for screenshot text

- [tesseract.js 7.0.0](https://github.com/naptha/tesseract.js), Apache License 2.0
- [tesseract.js-core 7.0.0](https://github.com/naptha/tesseract.js-core), Apache License 2.0. Only the three LSTM builds are included: `tesseract-core-lstm.wasm.js`, `tesseract-core-simd-lstm.wasm.js`, and `tesseract-core-relaxedsimd-lstm.wasm.js`. The non-LSTM builds were left out because the page requests the LSTM engine
- English data: `@tesseract.js-data/eng@1.0.0` file `4.0.0_best_int/eng.traineddata.gz` (about 2.8 MiB). The npm package declares MIT. The upstream [tessdata](https://github.com/tesseract-ocr/tessdata) project is Apache-2.0. Both notices are in `scam-guardian/vendor/tesseract/`
- Bundled pieces named in the minified license files: regenerator-runtime (MIT), buffer (MIT), ieee754 (BSD-3-Clause), zlib.js (MIT)
- Checked in headless Chrome against a local screenshot. The worker read “benefits are suspended” and “gift card” without a network call
- Limit: browsers block the worker when the HTML file is opened with `file://`. Pasted-text analysis works from `file://`. OCR works when the folder is served over HTTP, including a local static server. That server still does not need the public internet

### Scram, credited and not copied

- Repository: [github.com/erfunm/Scram](https://github.com/erfunm/Scram)
- License of the application code: MIT, by Erfan Mirhosseini
- What it is: an Android app that screenshots the phone, runs on-device OCR, and asks Gemma 3n (about 3.1 GB in the README) to judge the text. The author’s Kaggle write-up describes a rule-style prompt around Gemma 3n E2B
- Why the code was not imported: it is Kotlin for Android, and the useful model is Gemma. [Gemma Terms of Use](https://ai.google.dev/gemma/terms) are not the MIT license. They allow use under use-restrictions that must be passed on, and the weights are far too large for this static toolkit
- What was taken from the idea, without copying code: a screenshot stays on the device, text is read locally, and the result explains the reason. The rules here are a new set aimed at veteran and older-adult fraud, not Scram’s prompt

### Rejected for Scam Guardian

| Source | Why it was not used |
| --- | --- |
| Gemma 3n, WebLLM, and MLC weights | Multi-gigabyte files. Gemma’s terms are a separate contract, not a fit for “MIT repo, no extra use-policy machinery.” A phone-sized model would also make the page unusable for many older adults |
| transformers.js toxicity or phishing classifiers | Possible under Apache-2.0 for some models, but the public checkpoints found in this pass are not trained on VA benefits fraud, and even small ONNX models are tens of megabytes with an unmeasured error rate on this task. The typed rules are explainable. A general toxicity score would not be |
| Deepfake detectors | The previous page title claimed deepfake detection. No face, voice, or video model with a clear redistribution license was small enough to vendor honestly. The title no longer says deepfake. The tutor defines the word and says this toolkit does not detect them |
| Commercial scam feeds and paid threat-intel APIs | Not open, and they would be a network call |

## Plain-English AI Tutor

No third-party course text was copied. The 36 glossary entries, 6 lessons, and 19 quiz questions were written for this repository. They explain public ideas (models, prompts, hallucinations, phishing, deepfakes) in original sentences. They are not a certified curriculum and not the Foundation’s older website copy, because that website text was not in this repo and was not scraped.

A search for an open veteran-transition textbook with a license compatible with MIT did not turn up a glossary that was both on point and clearly reusable. Writing the lessons avoided that problem.

## Transition Companion

The checklist text is original. Official destinations are links, opened only when the person clicks:

- [VA.gov](https://www.va.gov/), [disability compensation](https://www.va.gov/disability/), [pension](https://www.va.gov/pension/), [GI Bill overview](https://www.va.gov/education/about-gi-bill-benefits/), [health care application](https://www.va.gov/forms/10-10ez/apply-va-healthcare/), [service records](https://www.va.gov/records/get-military-service-records/), [careers](https://www.va.gov/careers-employment/), [accreditation FAQ](https://www.va.gov/ogc/accred_faqs.asp), [benefits fraud prevention](https://benefits.va.gov/BENEFITS/fraud-prevention.asp)
- [TAP events](https://www.tapevents.mil/), [DoD TAP](https://www.dodtap.mil/dodtap/), [SkillBridge](https://www.skillbridge.mil/) (the older `skillbridge.osd.mil` address redirected there)
- [DOL VETS](https://www.dol.gov/agencies/vets), [My Next Move for Veterans](https://www.mynextmove.org/vets/), [National Archives military records](https://www.archives.gov/veterans/military-service-records)
- [SBA veteran-owned business counseling](https://www.sba.gov/counseling/grow-your-business/#veteran-owned)
- [ReportFraud](https://reportfraud.ftc.gov/), [IC3](https://www.ic3.gov/), [VA OIG](https://www.vaoig.gov/)
- [DoD COOL](https://www.cool.osd.mil/), linked but not mirrored

HTTP checks from this build environment returned 200 for the VA.gov, DOL, TAP, SkillBridge, Archives, SBA, ReportFraud, IC3, and VA OIG addresses above. `cool.osd.mil` did not connect (it is a `.mil` host and may be filtered here). `ssa.gov`, `consumer.ftc.gov`, `bls.gov`, `fbi.gov`, and CareerOneStop returned 403 to the automated client even for real public pages, so those were not required as the only path. BLS handbook links inside the career tool are still the URLs printed in the BLS crosswalk file.

## Other projects considered

- Debriefed’s single-file app download is a full resume product with optional calls to Anthropic. Reusing that shell would have pulled an API path into a toolkit that promises no runtime network calls. The dictionary was the part that belonged here
- In-browser LLM runtimes (WebLLM, transformers.js) remain a possible later experiment if a small, permissively licensed model is trained on text this project has the right to use. They are not required for the four tools to function, and they were not vendored
