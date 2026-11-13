# Third-party notices

The AI Cowboys Foundation’s code and original tutor and checklist text are under the MIT license in [LICENSE](LICENSE). The items below are not relicensed as MIT. Their notices have to stay with them.

## Debriefed

Career phrasing and the offline dictionary rows used by the translator are derived from Debriefed.

- https://github.com/csimser/debriefed
- Commit `7d75063a4d816ab615cdfbe8868045490837f725`
- Manifest `2026-05-20.83b39983` reports `total_rows` 34,071. A copy of that manifest is in [career-pathway-translator/vendor/debriefed/manifest.json](career-pathway-translator/vendor/debriefed/manifest.json)
- This toolkit ships 8,361 of those rows in `career-pathway-translator/data/phrases.js`: 493 MOS notes, 1,124 phrase translations, 745 evaluation phrases, 1,675 jargon entries, 1,149 acronyms, 57 ranks, 22 soft skills, 1,109 action verbs, 845 bullet examples, 24 quantification helpers, 36 industry-framing examples, 404 professional-summary examples, and 678 keyword lists
- Not shipped from that manifest: `onet_crosswalk` (24,248; the DMDC file is the military source), `onet_occupations` (427; O*NET 31.0 is used instead), cover-letter, résumé, and LinkedIn templates, funding tables, and gap recommendations that state costs and discounts this toolkit does not verify
- MIT License. Copyright (c) 2026 Chris Simser
- Full text: [career-pathway-translator/vendor/debriefed/LICENSE](career-pathway-translator/vendor/debriefed/LICENSE)
- The MIT grant covers Chris Simser’s dictionary. It does not relicense DMDC or O*NET facts that this toolkit shows beside that dictionary

## Defense Manpower Data Center crosswalk

Military occupation codes, titles, personnel categories, active or obsolete status, and O*NET-SOC linkages are from `milx0724.csv` (July 2024), obtained in `military_crosswalk.zip` from https://www.onetcenter.org/dl_files/2019/military_crosswalk.zip.

The Read Me in that zip says “Source: Defense Manpower Data Center.” O*NET OnLine lists this crosswalk as external data that is not covered by the O*NET content license. This project treats the file as a U.S. government work and does not apply the MIT license or the CC BY license to it.

The shipped file keeps primary enlisted, warrant, and officer records for Army, Navy, Air Force, Marine Corps, Coast Guard, and Space Force. It drops add-on identifier systems and unused columns.

## O*NET 31.0 Database

Occupation titles, descriptions, important skill names, sample reported job titles, and job-zone text come from the O*NET 31.0 Database.

This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/). O*NET® is a trademark of USDOL/ETA. The AI Cowboys Foundation has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.

License page: https://www.onetcenter.org/license_db.html

Modifications: the database was reduced to the fields listed above. Importance-rated skills were limited to six names per occupation. Statistical columns were not included. A change list is the build script [scripts/build_career_data.py](scripts/build_career_data.py). Questions about the subset can be directed to the Foundation that publishes this repository.

## Bureau of Labor Statistics

Handbook profile URLs come from the Occupational Outlook Handbook crosswalk maintained by the Bureau of Labor Statistics and posted by the O*NET Resource Center (October 2026 file). Handbook articles were not copied. BLS material used here is a U.S. government work.

## SMS Spam Collection v.1

The scam page’s secondary hint is a derivative model (word log-odds only). The collection text is not distributed.

Copyright for the SMS Spam Collection v.1 is held by Tiago Agostinho de Almeida and José María Gómez Hidalgo. The collection’s own notice states that it is provided at no charge, without warranty, and that the user bears the risk of use, distribution, modification, reproduction, and publication, including derivative works. The authors ask for a citation:

Almeida, T.A., Gómez Hidalgo, J.M., Yamakami, A. Contributions to the Study of SMS Spam Filtering: New Collection and Results. Proceedings of the 2011 ACM Symposium on Document Engineering (DOCENG’11), Mountain View, CA, USA, 2011.

Collection site referenced by the authors: http://www.dt.fee.unicamp.br/~tiago/smsspamcollection/

The UCI distribution used to train the model: https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip

## Tesseract.js and traineddata

Local OCR files are in [scam-guardian/vendor/tesseract/](scam-guardian/vendor/tesseract/).

- tesseract.js 7.0.0, Apache License 2.0. https://github.com/naptha/tesseract.js
- tesseract.js-core 7.0.0, Apache License 2.0. https://github.com/naptha/tesseract.js-core
  LSTM-only builds included: `tesseract-core-lstm.wasm.js`, `tesseract-core-simd-lstm.wasm.js`, `tesseract-core-relaxedsimd-lstm.wasm.js`
- English `4.0.0_best_int/eng.traineddata.gz` from `@tesseract.js-data/eng` 1.0.0. That npm package declares MIT. Upstream tessdata is Apache License 2.0: https://github.com/tesseract-ocr/tessdata and https://github.com/naptha/tessdata
- Notices compiled into the minified files: regenerator-runtime, MIT, Copyright (c) 2014-present, Facebook, Inc.; buffer, MIT, Feross Aboukhadijeh; ieee754, BSD-3-Clause, Feross Aboukhadijeh; zlib.js, MIT, imaya

Apache License 2.0 texts: [LICENSE.tesseract.js.md](scam-guardian/vendor/tesseract/LICENSE.tesseract.js.md) and [LICENSE.tesseract.js-core](scam-guardian/vendor/tesseract/LICENSE.tesseract.js-core).

## Scram

The messaging, email, and other categories, the messaging point rubric, the email checklist, and the general scam prompt are adapted from Scram. The Android application is not included.

- https://github.com/erfunm/Scram
- Commit `8610b7db4b2d6f8398b5ecbef0c4a18a0e81e1bf`
- MIT License. Copyright (c) 2025 Erfan Mirhosseini
- Full text: [scam-guardian/vendor/scram/LICENSE](scam-guardian/vendor/scram/LICENSE)
- The parser in `ScamDetectionModelHelper.kt` assigns 0.85 or 0.15 after a label. Those figures are not a measured probability and are not shown here
- Scram’s README describes a 3.1 GB Gemma 3n model. Those weights are not in the Scram repository and are not in this one

## Optional Gemma 3 270M model

Not shipped in the repository. Downloaded only after the person chooses the button that states the size.

- Repository: https://huggingface.co/onnx-community/gemma-3-270m-it-ONNX
- Revision `2dbbfdb1b59bd034eb959428c6a7da9dd7ea27f0`
- Hugging Face model card license field: `gemma`
- Terms: https://ai.google.dev/gemma/terms
- WebGPU `q4f16` files plus tokenizer files: 297,975,376 bytes
- WASM `q8` (`model_quantized`) files plus the same tokenizer files: 570,293,367 bytes
- Browser cache name used by the runtime: `transformers-cache`
- Not part of the service-worker precache

## Transformers.js and ONNX Runtime Web

Stored under [shared/vendor/transformers/](shared/vendor/transformers/) so the optional model can run without a script CDN. Loaded only after the person chooses the download. Not precached.

- `@huggingface/transformers` 4.3.2, Apache License 2.0. [LICENSE.transformers](shared/vendor/transformers/LICENSE.transformers)
- `onnxruntime-web` 1.31.0-dev.20260914-8d85527a0, MIT. Copyright (c) Microsoft Corporation. [LICENSE.onnxruntime](shared/vendor/transformers/LICENSE.onnxruntime)
- `transformers.web.js` was edited so its ONNX import and wasm path point at this folder

## Not included

RAND Army KSA data, DoD COOL spreadsheets, ASVAB / Careers in the Military supplemental files, and the VOW enhanced-analysis spreadsheet were not copied. Reasons are in [docs/RESEARCH.md](docs/RESEARCH.md).
