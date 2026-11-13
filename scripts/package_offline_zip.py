#!/usr/bin/env python3
"""Build a zip of the static site so it can be unpacked and opened offline."""

from __future__ import annotations

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "open-veteran-pathways-toolkit-offline.zip"
SKIP_DIRS = {
    ".git",
    ".github",
    "node_modules",
    "test-results",
    "playwright-report",
    "blob-report",
    "dist",
    "tests",
    "playwright",
}
SKIP_FILES = {".gitignore"}


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        OUT.unlink()
    count = 0
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(ROOT.rglob("*")):
            if not path.is_file():
                continue
            rel = path.relative_to(ROOT)
            if any(part in SKIP_DIRS for part in rel.parts):
                continue
            if path.name in SKIP_FILES or path.suffix == ".zip":
                continue
            archive.write(path, rel.as_posix())
            count += 1
    print(f"wrote {OUT.relative_to(ROOT)} files={count} bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
