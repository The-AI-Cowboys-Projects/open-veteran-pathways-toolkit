#!/usr/bin/env python3
"""Build the offline Career Pathway Translator data files.

Downloads are cached under /tmp/ovpt-career-src when possible.
Outputs JavaScript assignments so the tool works from file:// as well as HTTP.
"""

from __future__ import annotations

import csv
import io
import json
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "career-pathway-translator" / "data"
VENDOR = ROOT / "career-pathway-translator" / "vendor" / "debriefed"
CACHE = Path("/tmp/ovpt-career-src")

DEBRIEFED_SHA = "7d75063a4d816ab615cdfbe8868045490837f725"
DEBRIEFED_RAW = f"https://raw.githubusercontent.com/csimser/debriefed/{DEBRIEFED_SHA}"
# public-data/manifest.json in that commit. The project describes this as 33,000+.
DEBRIEFED_MANIFEST_VERSION = "2026-05-20.83b39983"
DEBRIEFED_REPORTED_ROWS = 34071
ONET_CSV = "https://www.onetcenter.org/dl_files/database/db_31_0_csv"
MOC_ZIP = "https://www.onetcenter.org/dl_files/2019/military_crosswalk.zip"
OOH_XLSX = "https://www.onetcenter.org/crosswalks/ooh/Occupation_Handbook_to_ONET-SOC.xlsx"

PRIMARY_SVC = {"A", "C", "F", "H", "M", "N", "O", "P", "S"}
PERSONNEL = {"E", "O", "W"}

BRANCHES = {
    "army": {"label": "Army", "svc": ["A"]},
    "navy": {"label": "Navy", "svc": ["N", "P", "S"]},
    "usaf": {"label": "Air Force", "svc": ["F"]},
    "usmc": {"label": "Marine Corps", "svc": ["M"]},
    "uscg": {"label": "Coast Guard", "svc": ["C"]},
    "ussf": {"label": "Space Force", "svc": ["H", "O"]},
}
SVC_BRANCH = {svc: bid for bid, meta in BRANCHES.items() for svc in meta["svc"]}
MPC_LABEL = {"E": "Enlisted", "O": "Officer", "W": "Warrant officer"}


def fetch(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        print(f"cache {dest.name}")
        return dest
    print(f"get {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "ovpt-data-build/1.0"})
    with urllib.request.urlopen(req, timeout=180) as resp:
        dest.write_bytes(resp.read())
    return dest


def load_json(url: str, name: str):
    path = fetch(url, CACHE / "debriefed" / name)
    return json.loads(path.read_text(encoding="utf-8"))


def dump_js(global_name: str, obj: object, path: Path) -> None:
    text = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    text = text.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029").replace("</", "<\\/")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"self.{global_name} = {text};\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} {path.stat().st_size} bytes")


def blank(value: str | None) -> bool:
    return value is None or value.strip() in {"", "-"}


def load_debriefed():
    curated_raw = load_json(f"{DEBRIEFED_RAW}/public-data/mos_to_civilian.json", "mos_to_civilian.json")
    phrases = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/phrase_translations.json", "phrase_translations.json"):
        mil = (row.get("military_phrase") or "").strip()
        civ = (row.get("civilian_phrase") or "").strip()
        if mil and civ:
            phrases.append([mil, civ, row.get("category") or ""])

    evals = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/eval_phrases.json", "eval_phrases.json"):
        mil = (row.get("eval_phrase") or "").strip()
        civ = (row.get("civilian_translation") or "").strip()
        if mil and civ:
            evals.append([mil, civ, row.get("branch") or "", row.get("category") or ""])

    jargon = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/military_jargon.json", "military_jargon.json"):
        term = (row.get("military_term") or "").strip()
        civ = (row.get("civilian_equivalent") or "").strip()
        if term and civ:
            jargon.append([term, civ, row.get("category") or ""])
    jargon.sort(key=lambda item: len(item[0]), reverse=True)

    acronyms = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/acronyms.json", "acronyms.json"):
        short = (row.get("acronym") or "").strip()
        full = (row.get("full_term") or "").strip()
        plain = (row.get("civilian_explanation") or "").strip()
        if len(short) >= 2 and full:
            acronyms.append([short, full, plain])

    ranks = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/rank_equivalents.json", "rank_equivalents.json"):
        ranks.append(
            {
                "branch": row.get("branch") or "",
                "paygrade": row.get("paygrade") or "",
                "rank": row.get("military_rank") or "",
                "civilian": row.get("civilian_equivalent") or "",
                "level": row.get("responsibility_level") or "",
                "team": row.get("typical_team_size") or "",
                "gs": row.get("federal_gs_equivalent") or "",
            }
        )

    soft = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/soft_skills.json", "soft_skills.json"):
        soft.append(
            {
                "context": row.get("military_context") or "",
                "skill": row.get("civilian_skill") or "",
                "phrase": row.get("resume_phrase") or "",
            }
        )

    verbs: dict[str, list[str]] = defaultdict(list)
    verb_rows = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/action_verbs.json", "action_verbs.json"):
        verb = (row.get("verb") or "").strip()
        category = row.get("category") or "General"
        strength = row.get("strength") or ""
        if not verb:
            continue
        verb_rows.append([verb, category, strength])
        if strength == "strong" and verb not in verbs[category]:
            verbs[category].append(verb)

    bullets = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/bullet_patterns.json", "bullet_patterns.json"):
        example = (row.get("example_output") or "").strip()
        if not example:
            continue
        name = row.get("pattern_name") or ""
        tokens = [part for part in name.replace("-", "_").split("_") if len(part) >= 4 and not part.isdigit()]
        bullets.append(
            {
                "c": row.get("category") or "",
                "o": example,
                "k": tokens[:8],
            }
        )

    vague = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/quantification_helpers.json", "quantification_helpers.json"):
        phrase = (row.get("vague_phrase") or "").strip()
        alts = [item for item in (row.get("quantified_alternatives") or []) if item]
        if phrase and alts:
            vague.append([phrase, alts[:4], row.get("category") or ""])

    framing = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/industry_framing.json", "industry_framing.json"):
        text = (row.get("framed_description") or "").strip()
        if not text:
            continue
        framing.append(
            {
                "e": row.get("military_experience") or "",
                "i": row.get("target_industry") or "",
                "d": text,
                "k": [item for item in (row.get("keywords") or []) if item][:8],
            }
        )

    summaries = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/professional_summaries.json", "professional_summaries.json"):
        text = (row.get("example_output") or row.get("template_text") or "").strip()
        if not text:
            continue
        summaries.append(
            {
                "role": row.get("target_role") or "",
                "industry": row.get("target_industry") or "",
                "tier": row.get("rank_tier") or "",
                "text": text,
            }
        )

    ats = []
    for row in load_json(f"{DEBRIEFED_RAW}/public-data/ats_keywords.json", "ats_keywords.json"):
        words = [item for item in (row.get("keywords") or []) if item]
        if words:
            ats.append(
                {
                    "industry": row.get("industry") or "",
                    "role": row.get("role_type") or "",
                    "words": words[:20],
                }
            )

    return {
        "curated_raw": curated_raw,
        "phrases": phrases,
        "evals": evals,
        "jargon": jargon,
        "acronyms": acronyms,
        "ranks": ranks,
        "soft": soft,
        "verbs": verbs,
        "verb_rows": verb_rows,
        "bullets": bullets,
        "vague": vague,
        "framing": framing,
        "summaries": summaries,
        "ats": ats,
    }


def curated_from(curated_raw, occupations):
    curated = []
    missing_codes = []
    for row in curated_raw:
        onet_codes = []
        for code in row.get("onet_codes") or []:
            code = str(code).strip()
            if not code:
                continue
            onet_codes.append(code)
            if occupations is not None and code not in occupations:
                missing_codes.append(code)
        curated.append(
            {
                "branch": row.get("branch") or "",
                "code": row.get("military_code") or "",
                "title": row.get("military_title") or "",
                "civilian": [t for t in (row.get("civilian_titles") or []) if t],
                "onet": onet_codes,
                "skills": [s for s in (row.get("key_skills") or []) if s],
                "industries": [s for s in (row.get("industries") or []) if s],
                "description": row.get("description") or "",
            }
        )
    return curated, sorted(set(missing_codes))


def debriefed_counts(bundle, curated):
    shipped = {
        "mos_to_civilian": len(curated),
        "phrase_translations": len(bundle["phrases"]),
        "eval_phrases": len(bundle["evals"]),
        "military_jargon": len(bundle["jargon"]),
        "acronyms": len(bundle["acronyms"]),
        "rank_equivalents": len(bundle["ranks"]),
        "soft_skills": len(bundle["soft"]),
        "action_verbs": len(bundle["verb_rows"]),
        "bullet_patterns": len(bundle["bullets"]),
        "quantification_helpers": len(bundle["vague"]),
        "industry_framing": len(bundle["framing"]),
        "professional_summaries": len(bundle["summaries"]),
        "ats_keywords": len(bundle["ats"]),
    }
    # Manifest row counts for tables this toolkit does not put in the page.
    # onet_crosswalk is a second-hand extract; DMDC milx0724 is the military source.
    # onet-occupations is a smaller occupation list than the O*NET 31.0 file used here.
    not_shipped = {
        "onet_crosswalk": 24248,
        "onet_occupations": 427,
        "cover_letter_templates": 351,
        "cert_funding": 123,
        "gap_recommendations": 86,
        "linkedin_keywords": 447,
        "funding_programs": 15,
        "linkedin_templates": 10,
        "resume_templates": 3,
    }
    return shipped, not_shipped


def write_debriefed_notice() -> None:
    license_path = fetch(f"{DEBRIEFED_RAW}/LICENSE", CACHE / "debriefed" / "LICENSE")
    manifest_path = fetch(f"{DEBRIEFED_RAW}/public-data/manifest.json", CACHE / "debriefed" / "manifest.json")
    VENDOR.mkdir(parents=True, exist_ok=True)
    (VENDOR / "LICENSE").write_text(license_path.read_text(encoding="utf-8"), encoding="utf-8")
    (VENDOR / "manifest.json").write_text(manifest_path.read_text(encoding="utf-8"), encoding="utf-8")
    (VENDOR / "NOTICE").write_text(
        "\n".join(
            [
                "Debriefed dictionary extracts",
                "",
                "Source: https://github.com/csimser/debriefed",
                f"Commit: {DEBRIEFED_SHA}",
                f"Manifest: {DEBRIEFED_MANIFEST_VERSION}",
                f"That manifest reports total_rows {DEBRIEFED_REPORTED_ROWS}.",
                "License: MIT. Copyright (c) 2026 Chris Simser.",
                "See LICENSE in this folder. The MIT license applies to Chris Simser's",
                "dictionary software and phrasing. It does not relicense U.S. government",
                "or O*NET data that may appear alongside it.",
                "",
                "The page uses a conversion of the public-data JSON in that commit:",
                "phrase translations, evaluation phrases, jargon, acronyms, MOS notes,",
                "ranks, soft skills, action verbs, resume-bullet examples, quantification",
                "helpers, industry-framing examples, professional-summary examples, and",
                "keyword lists. The conversion is career-pathway-translator/data/phrases.js.",
                "manifest.json in this folder is the upstream row manifest, unmodified.",
                "",
                "Not converted into the page: onet_crosswalk.json (the DMDC file is the",
                "military source), onet-occupations.json (O*NET 31.0 is used instead),",
                "cover-letter and resume and LinkedIn templates, funding tables, and",
                "gap recommendations that state costs and discounts this toolkit does",
                "not verify. Occupation facts shown next to the dictionary come from",
                "the DMDC crosswalk and the O*NET 31.0 Database, which keep their own",
                "terms. See THIRD_PARTY_NOTICES.md.",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    zip_path = fetch(MOC_ZIP, CACHE / "military_crosswalk.zip")
    with zipfile.ZipFile(zip_path) as zf:
        csv_name = next(n for n in zf.namelist() if n.endswith(".csv"))
        moc_text = zf.read(csv_name).decode("utf-8")
    rows_out = []
    seen = set()
    for row in csv.DictReader(io.StringIO(moc_text)):
        svc = row["SVC"].strip()
        mpc = row["MPC"].strip()
        if svc not in PRIMARY_SVC or mpc not in PERSONNEL:
            continue
        code = row["MOC"].strip()
        title = " ".join(row["MOC_TITLE"].split())
        if blank(code) or blank(title):
            continue
        onets = []
        for i in range(1, 5):
            code_i = row[f"ONET{i}"].strip()
            if not blank(code_i) and code_i not in onets:
                onets.append(code_i)
        status = row["STATUS"].strip() or "A"
        key = (svc, mpc, code.upper(), status, title)
        if key in seen:
            continue
        seen.add(key)
        rows_out.append([svc, mpc, code, title, onets, status])

    occ_path = fetch(f"{ONET_CSV}/occupation_data.csv", CACHE / "occupation_data.csv")
    skills_path = fetch(f"{ONET_CSV}/essential_skills.csv", CACHE / "essential_skills.csv")
    titles_path = fetch(f"{ONET_CSV}/sample_of_reported_titles.csv", CACHE / "sample_of_reported_titles.csv")
    zones_path = fetch(f"{ONET_CSV}/job_zones.csv", CACHE / "job_zones.csv")
    zone_ref_path = fetch(f"{ONET_CSV}/job_zone_reference.csv", CACHE / "job_zone_reference.csv")
    ooh_path = fetch(OOH_XLSX, CACHE / "ooh.xlsx")

    occupations = {}
    with occ_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            code = row["O*NET-SOC Code"].strip()
            occupations[code] = {
                "t": row["Title"].strip(),
                "d": " ".join(row["Description"].split()),
                "z": "",
                "s": [],
                "j": [],
                "u": "",
            }

    with zones_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            code = row["O*NET-SOC Code"].strip()
            if code in occupations:
                occupations[code]["z"] = row["Job Zone"].strip()

    zone_ref = {}
    with zone_ref_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            zone_ref[row["Job Zone"].strip()] = {
                "name": row["Name"].strip(),
                "experience": " ".join(row["Experience"].split()),
                "education": " ".join(row["Education"].split()),
                "training": " ".join(row["Job Training"].split()),
                "examples": " ".join(row["Examples"].split()),
            }

    skill_bucket: dict[str, list[tuple[float, str]]] = defaultdict(list)
    with skills_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            if row["Scale ID"] != "IM":
                continue
            if row["Recommend Suppress"] == "Y" or row["Not Relevant"] == "Y":
                continue
            code = row["O*NET-SOC Code"].strip()
            if code not in occupations:
                continue
            try:
                value = float(row["Data Value"])
            except ValueError:
                continue
            skill_bucket[code].append((value, row["Element Name"].strip()))
    for code, pairs in skill_bucket.items():
        pairs.sort(key=lambda item: (-item[0], item[1]))
        occupations[code]["s"] = [name for _, name in pairs[:6]]

    title_bucket: dict[str, list[str]] = defaultdict(list)
    with titles_path.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            code = row["O*NET-SOC Code"].strip()
            title = row["Reported Job Title"].strip()
            if code in occupations and title and title not in title_bucket[code]:
                title_bucket[code].append(title)
    for code, titles in title_bucket.items():
        occupations[code]["j"] = titles[:6]

    import openpyxl

    wb = openpyxl.load_workbook(ooh_path, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    header_seen = False
    for record in ws.iter_rows(values_only=True):
        if not header_seen:
            if record and record[0] == "Occupation Handbook Code":
                header_seen = True
            continue
        if not record or not record[2] or not record[4]:
            continue
        code = str(record[2]).strip()
        url = str(record[4]).strip()
        if code in occupations and not occupations[code]["u"] and url.startswith("https://www.bls.gov/"):
            occupations[code]["u"] = url
    wb.close()

    bundle = load_debriefed()
    curated, missing_codes = curated_from(bundle["curated_raw"], occupations)
    write_debriefed_notice()
    shipped, not_shipped = debriefed_counts(bundle, curated)

    active = sum(1 for row in rows_out if row[5] == "A")
    with_onet = sum(1 for row in rows_out if row[4])
    meta = {
        "mocFile": "milx0724.csv",
        "mocUpdated": "July 2024",
        "mocRows": len(rows_out),
        "mocActive": active,
        "mocWithOnet": with_onet,
        "occupations": len(occupations),
        "curated": len(curated),
        "curatedOnetMissingFrom31": missing_codes,
        "phrases": len(bundle["phrases"]),
        "evals": len(bundle["evals"]),
        "jargon": len(bundle["jargon"]),
        "jargonAppliedMinChars": 4,
        "acronyms": len(bundle["acronyms"]),
        "ranks": len(bundle["ranks"]),
        "soft": len(bundle["soft"]),
        "verbCategories": len(bundle["verbs"]),
        "verbRows": len(bundle["verb_rows"]),
        "bullets": len(bundle["bullets"]),
        "vague": len(bundle["vague"]),
        "framing": len(bundle["framing"]),
        "summaries": len(bundle["summaries"]),
        "ats": len(bundle["ats"]),
        "debriefedCommit": DEBRIEFED_SHA,
        "debriefedManifestVersion": DEBRIEFED_MANIFEST_VERSION,
        "debriefedReportedRows": DEBRIEFED_REPORTED_ROWS,
        "debriefedShippedRows": sum(shipped.values()),
        "debriefedShipped": shipped,
        "debriefedNotShipped": not_shipped,
        "onet": "31.0",
        "oohCrosswalk": "October 2026 file from the O*NET Resource Center, maintained by BLS",
    }
    phrases = bundle["phrases"]
    evals = bundle["evals"]
    jargon = bundle["jargon"]
    acronyms = bundle["acronyms"]
    ranks = bundle["ranks"]
    soft = bundle["soft"]
    verbs = bundle["verbs"]
    bullets = bundle["bullets"]

    dump_js(
        "OVPT_MOC",
        {
            "branches": BRANCHES,
            "svcBranch": SVC_BRANCH,
            "mpc": MPC_LABEL,
            "rows": rows_out,
        },
        OUT / "moc.js",
    )
    dump_js("OVPT_OCC", {"zones": zone_ref, "occ": occupations}, OUT / "occupations.js")
    dump_js(
        "OVPT_PHRASES",
        {
            "curated": curated,
            "phrases": phrases,
            "evals": evals,
            "jargon": jargon,
            "acronyms": acronyms,
            "ranks": ranks,
            "soft": soft,
            "verbs": verbs,
            "verbRows": bundle["verb_rows"],
            "bullets": bullets,
            "vague": bundle["vague"],
            "framing": bundle["framing"],
            "summaries": bundle["summaries"],
            "ats": bundle["ats"],
        },
        OUT / "phrases.js",
    )
    dump_js("OVPT_META", meta, OUT / "meta.js")
    (OUT / "build-stats.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(meta, indent=2))


def phrases_only() -> None:
    """Refresh the Debriefed conversion without re-downloading DMDC or O*NET."""
    existing = json.loads((OUT / "build-stats.json").read_text(encoding="utf-8"))
    occ_text = (OUT / "occupations.js").read_text(encoding="utf-8")
    occ_payload = json.loads(occ_text.split("=", 1)[1].strip().rstrip(";"))
    bundle = load_debriefed()
    curated, missing_codes = curated_from(bundle["curated_raw"], occ_payload["occ"])
    write_debriefed_notice()
    shipped, not_shipped = debriefed_counts(bundle, curated)
    meta = dict(existing)
    meta.update(
        {
            "curated": len(curated),
            "curatedOnetMissingFrom31": missing_codes,
            "phrases": len(bundle["phrases"]),
            "evals": len(bundle["evals"]),
            "jargon": len(bundle["jargon"]),
            "jargonAppliedMinChars": 4,
            "acronyms": len(bundle["acronyms"]),
            "ranks": len(bundle["ranks"]),
            "soft": len(bundle["soft"]),
            "verbCategories": len(bundle["verbs"]),
            "verbRows": len(bundle["verb_rows"]),
            "bullets": len(bundle["bullets"]),
            "vague": len(bundle["vague"]),
            "framing": len(bundle["framing"]),
            "summaries": len(bundle["summaries"]),
            "ats": len(bundle["ats"]),
            "debriefedCommit": DEBRIEFED_SHA,
            "debriefedManifestVersion": DEBRIEFED_MANIFEST_VERSION,
            "debriefedReportedRows": DEBRIEFED_REPORTED_ROWS,
            "debriefedShippedRows": sum(shipped.values()),
            "debriefedShipped": shipped,
            "debriefedNotShipped": not_shipped,
        }
    )
    dump_js(
        "OVPT_PHRASES",
        {
            "curated": curated,
            "phrases": bundle["phrases"],
            "evals": bundle["evals"],
            "jargon": bundle["jargon"],
            "acronyms": bundle["acronyms"],
            "ranks": bundle["ranks"],
            "soft": bundle["soft"],
            "verbs": bundle["verbs"],
            "verbRows": bundle["verb_rows"],
            "bullets": bundle["bullets"],
            "vague": bundle["vague"],
            "framing": bundle["framing"],
            "summaries": bundle["summaries"],
            "ats": bundle["ats"],
        },
        OUT / "phrases.js",
    )
    dump_js("OVPT_META", meta, OUT / "meta.js")
    (OUT / "build-stats.json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: meta[k] for k in ("debriefedShippedRows", "debriefedReportedRows", "debriefedShipped", "jargon")}, indent=2))


if __name__ == "__main__":
    if "--phrases-only" in sys.argv:
        phrases_only()
    else:
        main()
