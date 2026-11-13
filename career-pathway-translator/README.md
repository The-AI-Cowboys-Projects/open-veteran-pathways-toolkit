# Career Pathway Translator

**Built by The AI Cowboys.** The AI Cowboys Foundation, [www.theaicowboysfoundation.org](https://www.theaicowboysfoundation.org), a veteran-owned AI lab in San Antonio.

Offline lookup of military occupation codes and civilian wording. Open `index.html` through a local static server, or open the file directly. Nothing you type is uploaded.

The page searches the July 2024 DMDC crosswalk (`milx0724`) and shows O*NET 31.0 descriptions, skills, sample titles, and job-zone text. Duty rewording, curated civilian titles, and pay-grade scope language come from the military-to-civilian phrase dictionary stored with the page.

This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the CC BY 4.0 license. O*NET® is a trademark of USDOL/ETA. The AI Cowboys Foundation has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.

Read the parent [README](../README.md) and [docs/RESEARCH.md](../docs/RESEARCH.md) for counts and limits. A match is not a job offer or a benefits decision. Some official O*NET links, including infantry, describe the military occupation itself.

Third-party license notices: see [THIRD_PARTY_LICENSES.md](../THIRD_PARTY_LICENSES.md).

Rebuild with `python3 scripts/build_career_data.py` from the repository root.
