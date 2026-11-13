# Scam Guardian evaluation

**Built by The AI Cowboys.** The AI Cowboys Foundation, [www.theaicowboysfoundation.org](https://www.theaicowboysfoundation.org), a veteran-owned AI lab in San Antonio.

This note records one run of `node eval/run.mjs` on the synthetic set in `eval/fixtures.json`. It is not a field accuracy claim, a veteran study, or a clearance that a low score means a message is safe.

## What was scored

The set is 22 hand-written messages. Thirteen are labeled scam. Nine are labeled not_scam. The file is marked synthetic. The messages use no real person, address, account, medical record, or government identifier. The passcode `150952` is the same invented example already used in the page checks.

The set was written in this repository to exercise tactics the rules name, plus three messages the rules are weak on, plus one warning that quotes a payment tactic. It is not a sample of messages veterans receive. A high score on this set does not estimate how the page will do on the next real message.

Reproduce the numbers:

```bash
npm run eval:scam
```

That prints JSON. `scripts/verify.mjs` runs the same function and checks that the three stamp lines below are still in this file. If the engine changes, run the script again and update this file from that output. Do not type a score that the script did not print.

## Decision rule

A rule-engine positive is level **high** or **medium**. Level **low** is negative. Medium means the page already tells the person to pause. A single rule of weight 1 or 2 can stay low. That choice is why `charity-pressure` (score 2) counts as a miss and `scam-awareness` (also score 2, labeled not_scam) counts as a correct negative.

The point rubric and the small 2011 SMS model are scored on the same messages. Neither one changes the rule level. The optional Gemma model was not run.

The engine skips a rule match when `not`, `never`, `don't`, `do not`, `won't`, or `will not` appears in the 16 characters before the match. That is why the warning “will not ask you to pay with a gift card” does not become a payment hit. The lure that says to pay with a gift card, with no negation in front of it, still matches.

## Results

Produced by `node eval/run.mjs` on 13 November 2026.

```
rules n=22 tp=10 fp=0 tn=9 fn=3 precision=1 recall=0.7692 f1=0.8696
rubric n=22 tp=2 fp=0 tn=9 fn=11 precision=1 recall=0.1538 f1=0.2667
sms n=22 tp=8 fp=3 tn=6 fn=5 precision=0.7273 recall=0.6154 f1=0.6667
```

Precision, recall, and F1 use the positive class (labeled scam). `precision=1` is the script’s value for 10 true positives and 0 false positives, not a rounded-up 0.999. SMS probability is the script’s value rounded to 4 decimal places. `1` means the script returned 1.

| id | label | rule level | score | hits | rubric | rubric points | SMS flagged | SMS probability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| va-suspend-gift | scam | high | 8 | benefits-impersonation, account-threat, payment-demand, urgency | scam | 4 | true | 0.9998 |
| rating-fee | scam | medium | 3 | claims-fee | not_scam | 0 | true | 0.9982 |
| pension-poach | scam | high | 6 | pension-poaching, claims-fee | not_scam | 0 | false | 0.171 |
| secrets-request | scam | high | 5 | benefits-impersonation, secrets-request | not_scam | 2 | false | 0.8909 |
| lookalike-link | scam | medium | 3 | suspicious-link, urgency | scam | 3 | true | 1 |
| romance-wire | scam | high | 5 | payment-demand, romance | not_scam | 1 | false | 0.0946 |
| prize-fee | scam | high | 8 | payment-demand, claims-fee, prize | not_scam | 1 | true | 1 |
| family-bail | scam | high | 6 | payment-demand, family-emergency | not_scam | 1 | false | 0.0433 |
| remote-access | scam | medium | 3 | remote-access | not_scam | 0 | false | 0.1417 |
| charity-pressure | scam | low | 2 | charity-pressure | not_scam | 2 | true | 0.9999 |
| va-loan | scam | high | 6 | claims-fee, va-loan, urgency | not_scam | 1 | true | 1 |
| urgency-only | scam | low | 1 | urgency | not_scam | 1 | true | 0.9992 |
| subtle-code | scam | low | 0 | none | not_scam | 0 | true | 0.9995 |
| clinic-appointment | not_scam | low | 0 | none | not_scam | 2 | true | 0.9999 |
| gi-bill-info | not_scam | low | 0 | none | not_scam | 0 | false | 0.453 |
| otp-do-not-share | not_scam | low | 0 | none | not_scam | -2 | true | 0.9972 |
| office-holiday | not_scam | low | 0 | none | not_scam | 0 | true | 0.9993 |
| deposit-notice | not_scam | low | 0 | none | not_scam | 0 | false | 0.6607 |
| tap-workshop | not_scam | low | 0 | none | not_scam | 0 | false | 0.0424 |
| protective-gift-card | not_scam | low | 0 | none | not_scam | 1 | false | 0.8767 |
| scam-awareness | not_scam | low | 2 | account-threat | not_scam | 0 | false | 0.0123 |
| skillbridge-info | not_scam | low | 0 | none | not_scam | 0 | false | 0.2006 |

### How to read the misses

Rule-engine false negatives, all labeled scam and scored low:

- `charity-pressure` matched the charity rule only. Weight 2 and a score of 2 stay low.
- `urgency-only` matched the urgency rule only. Weight 1 stays low.
- `subtle-code` matched nothing. It asks the reader to share “the code they text you” without the phrases the secrets rule lists.

The one rule-engine false positive in an earlier draft of this set was the protective gift-card warning. After the negation check above, that row is low and is a true negative. `scam-awareness` still matches the account-threat rule and stays low because the score is 2. Under this decision rule that row is a true negative, not a clean bill of health. The page still shows the hit when a person pastes it.

The rubric’s recall on this set is 0.1538 (2 of 13 scams). It was written as a second reading for messages and email, not as a copy of the 14 rules. Pension, romance, remote-access, and claim-fee wording can be high on the rules and still miss the rubric cutoff. That is expected. The rubric does not change the level on the page.

The SMS model flagged 3 of the 9 not_scam messages: `clinic-appointment` (0.9999), `otp-do-not-share` (0.9972), and `office-holiday` (0.9993). It also missed pension poaching, the secrets request, the romance wire, the family-bail wire, and the remote-access pitch. The model is a naive Bayes file trained on the SMS Spam Collection v.1 (promotional text messages from around 2011). The page already says that hint is weak on veteran-benefits fraud. These numbers agree. A flagged SMS probability is not a measured probability for VA impersonation.

## Optional on-device model

`gemma` in the script output is `not-run`. The weights are not in this repository. This run did not download them. CI does not load them. There is no Gemma precision or recall in this file because none was measured.

To try that path on your own machine:

1. From the repository root, run `python3 scripts/serve.py` and open Scam Guardian. Screenshot reading and the model download need HTTP. A double-clicked file is not enough.
2. Read the size and the Gemma terms on the page before any download. The page states the byte count. Confirm only if you accept those terms.
3. The page uses WebGPU when the browser has it, and a larger WASM build when it does not. If the browser has neither, the page says the model cannot run. The rules still run.
4. Paste one fixture from `eval/fixtures.json`. Read the suggestion as a draft for a person. It does not change the rule level, and this repository does not record a score for it.

## Limitations

- Twenty-two synthetic messages written next to the rules. Not a population sample, not a veteran usability study, and not a rate of harm prevented.
- Labels are the author’s labels for this exercise. Another reader could mark `urgency-only` as too thin to call a scam. The script would then print different recall. The messages and labels are in `eval/fixtures.json` so that choice can be inspected.
- The negation window is 16 characters. A different sentence could still match, or a real demand that puts “not” just before “pay” could be skipped. The table shows the protective warning after that rule. It does not prove every warning is safe.
- No inter-rater check, no confidence interval, and no holdout that the author had not seen. The SMS holdout figures already printed on the Scam Guardian page (about 88% precision and 99% recall at a 90% cutoff on one 20% slice of the 2011 collection) are a different test. They are not the numbers in the table above.
- A low result is not a clearance. The page says that, and this evaluation does not change it.
