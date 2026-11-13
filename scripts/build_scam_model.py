#!/usr/bin/env python3
"""Train a small binary naive Bayes SMS-spam model and write data/model.js.

The raw SMS corpus is not copied into the repo. Only word log-odds are shipped.
"""

from __future__ import annotations

import json
import math
import random
import re
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "scam-guardian" / "data" / "model.js"
CACHE = Path("/tmp/ovpt-scam-src")
URLS = [
    "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip",
    "https://archive.ics.uci.edu/ml/machine-learning-databases/00228/smsspamcollection.zip",
]
TOKEN = re.compile(r"[a-z0-9']+")
SEED = 20261113


def download() -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    dest = CACHE / "smsspam.zip"
    if dest.exists() and dest.stat().st_size > 1000:
        return dest.read_bytes()
    last = None
    for url in URLS:
        try:
            print("get", url)
            req = urllib.request.Request(url, headers={"User-Agent": "ovpt-data-build/1.0"})
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = resp.read()
            dest.write_bytes(data)
            return data
        except Exception as exc:  # noqa: BLE001 — try the next mirror
            last = exc
            print("fail", exc)
    raise SystemExit(f"Could not download SMS Spam Collection: {last}")


def load_messages(blob: bytes) -> list[tuple[int, str]]:
    raw = None
    if blob[:2] == b"PK":
        with zipfile.ZipFile(CACHE / "smsspam.zip") as zf:
            name = next(
                n
                for n in zf.namelist()
                if n.lower().endswith("smsspamcollection") or n.lower().endswith(".tsv") or "sms" in n.lower()
            )
            raw = zf.read(name).decode("utf-8", errors="replace")
    else:
        raw = blob.decode("utf-8", errors="replace")
    rows = []
    seen = set()
    for line in raw.splitlines():
        if "\t" not in line:
            continue
        label, text = line.split("\t", 1)
        label = label.strip().lower()
        text = " ".join(text.split())
        if label not in {"ham", "spam"} or not text or text in seen:
            continue
        seen.add(text)
        rows.append((1 if label == "spam" else 0, text))
    return rows


def tokens(text: str) -> set[str]:
    return set(TOKEN.findall(text.lower()))


def train(rows: list[tuple[int, set[str]]]) -> dict:
    spam_docs = sum(label for label, _ in rows)
    ham_docs = len(rows) - spam_docs
    spam_tf: Counter[str] = Counter()
    ham_tf: Counter[str] = Counter()
    for label, words in rows:
        bucket = spam_tf if label else ham_tf
        bucket.update(words)
    vocab = set(spam_tf) | set(ham_tf)
    scored = []
    for word in vocab:
        sw = spam_tf[word]
        hw = ham_tf[word]
        if sw + hw < 5:
            continue
        p_s = (sw + 1) / (spam_docs + 2)
        p_h = (hw + 1) / (ham_docs + 2)
        log_odds = math.log(p_s) - math.log(p_h)
        if abs(log_odds) < 1.0:
            continue
        scored.append((abs(log_odds), word, round(log_odds, 4)))
    scored.sort(reverse=True)
    words = {word: odds for _, word, odds in scored[:2000]}
    prior = math.log((spam_docs + 1) / (len(rows) + 2)) - math.log((ham_docs + 1) / (len(rows) + 2))
    return {"priorLogOdds": round(prior, 4), "words": words, "spamDocs": spam_docs, "hamDocs": ham_docs}


def score(model: dict, text: str) -> float:
    log_odds = model["priorLogOdds"]
    seen = set()
    for word in TOKEN.findall(text.lower()):
        if word in seen:
            continue
        seen.add(word)
        if word in model["words"]:
            log_odds += model["words"][word]
    if log_odds > 30:
        return 1.0
    if log_odds < -30:
        return 0.0
    return 1 / (1 + math.exp(-log_odds))


def metrics(model: dict, rows: list[tuple[int, str]], threshold: float) -> dict:
    tp = fp = tn = fn = 0
    for label, text in rows:
        pred = 1 if score(model, text) >= threshold else 0
        if pred == 1 and label == 1:
            tp += 1
        elif pred == 1 and label == 0:
            fp += 1
        elif pred == 0 and label == 0:
            tn += 1
        else:
            fn += 1
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    return {
        "holdout": len(rows),
        "threshold": threshold,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "falsePositives": fp,
        "falseNegatives": fn,
    }


def main() -> None:
    messages = load_messages(download())
    print("unique messages", len(messages), "spam", sum(l for l, _ in messages))
    rng = random.Random(SEED)
    rng.shuffle(messages)
    cut = int(len(messages) * 0.8)
    train_rows = messages[:cut]
    test_rows = messages[cut:]
    model = train([(label, tokens(text)) for label, text in train_rows])
    # 0.90 keeps holdout precision near 0.88. Lower cutoffs flag too much ordinary mail.
    report = metrics(model, test_rows, 0.9)
    report["at50"] = metrics(model, test_rows, 0.5)
    classic = score(model, "FREE prize winner claim now txt WIN to 87066")
    ordinary = score(model, "See you at the clinic on Tuesday and bring your ID")
    payload = {
        "kind": "binary-multinomial-naive-bayes",
        "trainedOn": "80 percent of the deduplicated SMS Spam Collection v.1",
        "splitSeed": SEED,
        "priorLogOdds": model["priorLogOdds"],
        "threshold": 0.9,
        "words": model["words"],
        "vocab": len(model["words"]),
        "trainSpam": model["spamDocs"],
        "trainHam": model["hamDocs"],
        "metrics": report,
        "sanity": {"classicSpamLike": round(classic, 4), "ordinary": round(ordinary, 4)},
        "citation": "Almeida, T.A., Gomez Hidalgo, J.M., Yamakami, A. Contributions to the Study of SMS Spam Filtering: New Collection and Results. Proceedings of the 2011 ACM Symposium on Document Engineering (DOCENG'11).",
    }
    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    text = text.replace("</", "<\\/")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(f"self.OVPT_SPAM_MODEL = {text};\n", encoding="utf-8")
    print("wrote", OUT, OUT.stat().st_size)
    print(json.dumps({k: payload[k] for k in ("vocab", "metrics", "sanity", "trainSpam", "trainHam")}, indent=2))


if __name__ == "__main__":
    main()
