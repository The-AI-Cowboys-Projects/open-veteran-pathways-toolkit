# Career Pathway Translator

Offline lookup of military occupation codes and civilian wording. Open `index.html` through a local static server, or open the file directly. Nothing you type is uploaded.

The page searches the July 2024 DMDC crosswalk (`milx0724`) and shows O*NET 31.0 descriptions, skills, sample titles, and job-zone text. Duty rewording, curated civilian titles, and pay-grade scope language come from Chris Simser’s Debriefed dictionary (MIT), commit `7d75063a4d816ab615cdfbe8868045490837f725`.

Read the parent [README](../README.md) and [docs/RESEARCH.md](../docs/RESEARCH.md) for counts, licenses, and limits. A match is not a job offer or a benefits decision. Some official O*NET links, including infantry, describe the military occupation itself.

Rebuild with `python3 scripts/build_career_data.py` from the repository root.
