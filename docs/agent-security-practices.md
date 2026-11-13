# Agent security practices in this toolkit

Pendleton, M., et al. (2026). Agent Security Framework, Version 1.0. The AI Cowboys. CC BY 4.0. https://doi.org/10.5281/zenodo.19561360

This note says how the Plain-English AI Tutor and the Transition Companion apply least-agency defaults. It is not a certification and not a claim that a grant was awarded.

## What the pages do

- A person chooses every step. The tutor does not mark a lesson read, score a quiz, or send a question until the person uses the control. The companion does not check a box because a date is close. A highlighted window is a cue, not a completed step.
- Neither page takes an action outside the browser. There is no form submission to an agency, no email, and no scheduled task.
- The tutor’s question box searches the lessons and glossary that ship in `ai-tutor/data/content.js`. The passages and their source links are shown before any model wording.
- An optional on-device model can phrase an answer only from those passages. The page asks it to cite a passage id. If the reply does not name one of the passages just shown, the page says not to use the reply. The model is a suggestion for a person to review.
- The same model, on Scam Guardian, is limited to scam and phishing text. It is not a deepfake detector and it does not change the written-rule level.

## What the pages do not do

- They do not call a model, a database, or an agency API on their own.
- They do not require the optional model. Lessons, quizzes, the checklist, the scam rules, and screenshot OCR work when the model is absent.
- They do not put the model weights in the service-worker precache. Weights download only after the person chooses the button that states the size.
- They do not store questions or checklist answers anywhere except this browser’s `localStorage`, until the person downloads a JSON backup or clears the data.

## Data handling

Typed text, quiz answers, and checklist checks stay on the device. The optional model runs in the browser. Its weights, if downloaded, come from the Hugging Face repository named on the page and are kept in the browser cache named `transformers-cache`. That download is the person’s choice. The toolkit does not add an account or an analytics call.
