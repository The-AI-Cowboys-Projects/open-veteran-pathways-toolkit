# Accessibility

**Built by The AI Cowboys.** The AI Cowboys Foundation, [www.theaicowboysfoundation.org](https://www.theaicowboysfoundation.org), a veteran-owned AI lab in San Antonio.

The landing page and the four tools aim at WCAG 2.1 Level AA. This note says what was checked automatically, what was reviewed in the code, and what has not been done with a screen reader by a person. It is not a certification and not a completed user test.

## What the pages include

- `lang="en"` on every page.
- A “Skip to content” link that is the first control in the tab order. The offline-update banner, when it is shown, comes after that link.
- Visible `:focus-visible` outlines. Light theme uses a black outline. Dark theme uses a white outline. A teal ring sits outside the outline. In forced colors the outline follows the system highlight.
- Labels tied to every text field, select, checkbox, radio, and file input that the pages ship. Quiz choices are in a fieldset with a legend.
- Buttons and navigation links use at least a 44 by 44 pixel target.
- `aria-live="polite"` on result regions. Scam Guardian, career lookup, dictionary wording, rank wording, tutor passages, and quiz scores move keyboard focus to the new heading or the score line. The glossary search writes a short count into a live region (“Showing 12 of 95 glossary entries”, or the empty-state sentence).
- Checking a companion step puts focus back on that checkbox after the list redraws, and the summary live region updates the count.
- `prefers-reduced-motion: reduce` turns off animation, transition, and smooth scrolling.
- Larger text and a light or dark theme are on every page. The theme follows the system until the person chooses.

## Contrast

Ratios below are the WCAG relative-luminance formula, computed for these hex values. Normal text needs 4.5:1. Large text and non-text UI boundaries need 3:1.

The brand teal `#3DD8C8` is 11.85:1 against black and 1.77:1 against white. It is used for black text on a teal fill (badges, the update banner, and the “Built by The AI Cowboys” mark, where `#111111` on `#3DD8C8` is 10.66:1) and for footer links on `#111111` (10.66:1). It is not used as text on white. Light-theme loading borders use `#0D5C54`, which is 7.85:1 on white. Dark-theme loading borders keep `#3DD8C8` on the dark card (9.62:1 on `#1C1C1C`).

The original brand magenta `#DD378A` is 4.99:1 for black text on it and 4.21:1 as text on white. 4.21:1 misses 4.5:1 for normal text. Interface magenta is therefore `#D4348A`: 4.66:1 for black text on the button, and 4.51:1 on white. Warning borders use the same shade (4.20:1 on the light warning fill `#FFF4F8`, and 3.88:1 on the dark warning fill `#2A121C`), which clears the 3:1 non-text bar. The decorative brand bar at the top of the header, and the icon files, still use `#3DD8C8` and `#DD378A`. Those graphics have no letters. They are not the text color.

Other text pairs used on the pages: `#1A1A1A` on white 17.40:1, `#0B3D38` links on white 12.08:1, `#F2F2F2` on `#111111` 16.87:1, white on `#111111` 18.88:1, `#F4F4F4` on `#1C1C1C` 15.49:1 in the dark theme, `#9AF3EA` links on `#1C1C1C` 13.29:1, and muted `#333333` on white 12.63:1 (`#D6D6D6` on `#121212` is 12.89:1 in the dark theme).

## Automated checks

`tests/a11y.spec.js` runs `@axe-core/playwright` on the landing page and the four tool pages, in light and dark themes, with the WCAG 2.1 A and AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`). The suite expects zero violations. The same file checks that the skip link is the first tab stop and that `prefers-reduced-motion: reduce` sets animation to none. `tests/tools.spec.js` checks keyboard submit on the career lookup, visible focus on the code field, and that the scam result heading takes focus. `tests/mobile.spec.js` checks a 360 pixel width for overflow and 44 pixel targets.

`npm test` runs those files. A green run is the automated record. This document does not paste a violation count from a run that was not that command.

## What was not tested by a person with assistive technology

No NVDA, JAWS, or VoiceOver session was completed for this statement. No magnification user walked the pages. No veteran usability session has been run. The keyboard focus moves and the live regions were reviewed in the markup and covered by the Playwright checks above. A person using a screen reader may still hit a confusing order or a noisy live region. That is a reason for the pilot plan in [PILOT_PLAN.md](PILOT_PLAN.md), not a result this file can claim.

Known limits of the automated pass:

- axe does not decide whether the writing is plain enough.
- The optional model download and screenshot reading were not given a separate assistive-technology pass. The controls sit in the same labeled page that axe loads.
- Icon contrast is not an axe text check. The icons are the decorative brand bars described above.
