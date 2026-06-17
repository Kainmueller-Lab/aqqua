#!/usr/bin/env python3
"""Fetch the latest catalog report + EcoTaxa projects list from GitLab and update assets/data/.

The per-instrument count is taken as MAX(EcoTaxa count, catalog report count) — the catalog
report under-counts some EcoTaxa-shared instruments, while EcoTaxa misses non-EcoTaxa data.

Requires:
    GITLAB_TOKEN env var — personal access token with read_api scope

Writes:
    assets/data/{YYYY}_{MM}.csv   — instrument image counts for the current month
    assets/data/filelist.json     — updated index of all CSV files

For local testing without hitting GitLab:
    --catalog-html PATH    use this local HTML file instead of fetching artifact
    --ecotaxa-tsv PATH     use this local TSV file instead of fetching from repo
"""

import argparse
import csv
import io
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import requests

# ── Config ────────────────────────────────────────────────────────────────────

GITLAB_HOST = "codebase.helmholtz.cloud"
PROJECT_PATH = "aqqua/AqQua-Data-Reports"
REF = "main"
JOB_NAME = "catalog-report"
ARTIFACT_PATH = "catalog-report/index.html"
ECOTAXA_TSV_PATH = "projects-list.tsv"

# Raw instrument names → canonical name used in the output CSV.
# Matched case-insensitively.
_NAME_MAP = {
    "plankton imager": "PlanktonImager",
    "zooscan": "Zooscan",
    "loki": "LOKI",
}

# Instrument name prefixes that get collapsed into a single entry.
_GROUP_PREFIXES = ["UVP", "CPICS"]

# Anything matching these (case-insensitive) gets dumped into "Other".
_EXPLICIT_OTHER = {"other camera", "other scanner", "other microscope", "?"}

# Instruments whose share of the total is below this fraction are merged into "Other".
_OTHER_THRESHOLD = 0.0025

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = REPO_ROOT / "assets" / "data"


# ── Fetch ─────────────────────────────────────────────────────────────────────


def _gitlab_get(url: str, token: str) -> str:
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=60)
    if resp.status_code == 404:
        sys.exit(f"Not found: {url}")
    resp.raise_for_status()
    return resp.text


def fetch_artifact_html(token: str) -> str:
    encoded = PROJECT_PATH.replace("/", "%2F")
    url = (
        f"https://{GITLAB_HOST}/api/v4/projects/{encoded}"
        f"/jobs/artifacts/{REF}/raw/{ARTIFACT_PATH}?job={JOB_NAME}"
    )
    return _gitlab_get(url, token)


def fetch_ecotaxa_tsv(token: str) -> str:
    encoded = PROJECT_PATH.replace("/", "%2F")
    file_enc = ECOTAXA_TSV_PATH.replace("/", "%2F")
    url = (
        f"https://{GITLAB_HOST}/api/v4/projects/{encoded}"
        f"/repository/files/{file_enc}/raw?ref={REF}"
    )
    return _gitlab_get(url, token)


# ── Normalization ─────────────────────────────────────────────────────────────


def normalize(name: str | None) -> str | None:
    """Canonicalize an instrument name. Returns None for empty input."""
    if not name:
        return None
    s = name.strip()
    if not s:
        return None
    lower = s.lower()
    if lower in _EXPLICIT_OTHER:
        return "Other"
    if lower in _NAME_MAP:
        return _NAME_MAP[lower]
    for prefix in _GROUP_PREFIXES:
        if s.upper().startswith(prefix):
            return prefix
    return s


# ── Parse ─────────────────────────────────────────────────────────────────────


def counts_from_catalog(html: str) -> dict[str, int]:
    m = re.search(r"const DATA = (\[.*?\]);", html, re.DOTALL)
    if not m:
        sys.exit("Could not find DATA in the artifact HTML.")
    data = json.loads(m.group(1))

    counts: dict[str, int] = defaultdict(int)
    for row in data:
        if row.get("conversion-status") is None:
            continue
        instr = normalize(row.get("sensor-family"))
        if instr is None:
            continue
        counts[instr] += row.get("converted-num-items") or 0
    return dict(counts)


def counts_from_ecotaxa(tsv: str) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    reader = csv.DictReader(io.StringIO(tsv), delimiter="\t")
    for row in reader:
        instr = normalize(row.get("Instrument"))
        if instr is None:
            continue
        raw = (row.get("Nb objects") or "").replace(",", "").replace(" ", "")
        try:
            counts[instr] += int(raw) if raw else 0
        except ValueError:
            continue
    return dict(counts)


# ── Combine ───────────────────────────────────────────────────────────────────


def combine(ecotaxa: dict[str, int], report: dict[str, int]) -> dict[str, int]:
    """Per-instrument max, then collapse small entries into 'Other'."""
    keys = set(ecotaxa) | set(report)
    merged = {k: max(ecotaxa.get(k, 0), report.get(k, 0)) for k in keys}

    total = sum(merged.values())
    other_sum = merged.pop("Other", 0)
    final: dict[str, int] = {}
    for k, v in merged.items():
        if total and v / total < _OTHER_THRESHOLD:
            other_sum += v
        else:
            final[k] = v
    if other_sum:
        final["Other"] = other_sum

    return dict(sorted(final.items(), key=lambda x: -x[1]))


# ── Write ─────────────────────────────────────────────────────────────────────


def write_csv(counts: dict[str, int], date: datetime) -> Path:
    label = f"{date.year}/{date.month:02d}"
    filename = f"{date.year}_{date.month:02d}.csv"
    path = DATA_DIR / filename

    # Enforce monotonic increase over the previous CSV file
    filelist_path = DATA_DIR / "filelist.json"
    if filelist_path.exists():
        filelist = json.loads(filelist_path.read_text(encoding="utf-8"))
        if filelist:
            last_file = filelist[-1]
            last_path = DATA_DIR / last_file
            if last_path.exists():
                with last_path.open("r", encoding="utf-8") as f:
                    reader = csv.DictReader(f, skipinitialspace=True)
                    try:
                        last_row = next(reader)
                        for k, v in last_row.items():
                            if k and k != "Label":
                                val = int(float(v.replace(",", ""))) if v.strip() else 0
                                if val > counts.get(k, 0):
                                    counts[k] = val
                    except StopIteration:
                        pass

    header = "Label, " + ", ".join(counts.keys())
    data_row = f"{label}, " + ", ".join(str(v) for v in counts.values())

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(header + "\n" + data_row + "\n", encoding="utf-8")
    print(f"Written: {path}")
    print(f"  {header}")
    print(f"  {data_row}")
    print(f"  Total: {sum(counts.values()):,}")
    return path


def update_filelist(filename: str) -> None:
    filelist_path = DATA_DIR / "filelist.json"
    filelist = json.loads(filelist_path.read_text(encoding="utf-8")) if filelist_path.exists() else []
    if filename not in filelist:
        filelist.append(filename)
        filelist_path.write_text(json.dumps(filelist, indent=2) + "\n", encoding="utf-8")
        print(f"Added {filename} to filelist.json")
    else:
        print(f"{filename} already in filelist.json")


# ── Main ──────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog-html", type=Path, help="Local HTML file to use instead of API")
    parser.add_argument("--ecotaxa-tsv", type=Path, help="Local TSV file to use instead of API")
    parser.add_argument("--no-write", action="store_true", help="Print result without touching disk")
    args = parser.parse_args()

    need_token = args.catalog_html is None or args.ecotaxa_tsv is None
    token = os.environ.get("GITLAB_TOKEN") if need_token else None
    if need_token and not token:
        sys.exit("Set GITLAB_TOKEN env var (read_api scope), or pass both --catalog-html and --ecotaxa-tsv.")

    if args.catalog_html:
        print(f"Reading catalog HTML from {args.catalog_html}")
        catalog_html = args.catalog_html.read_text(encoding="utf-8")
    else:
        print(f"Fetching {ARTIFACT_PATH} from {PROJECT_PATH} @ {REF}...")
        catalog_html = fetch_artifact_html(token)

    if args.ecotaxa_tsv:
        print(f"Reading EcoTaxa TSV from {args.ecotaxa_tsv}")
        ecotaxa_tsv = args.ecotaxa_tsv.read_text(encoding="utf-8")
    else:
        print(f"Fetching {ECOTAXA_TSV_PATH} from {PROJECT_PATH} @ {REF}...")
        ecotaxa_tsv = fetch_ecotaxa_tsv(token)

    report_counts = counts_from_catalog(catalog_html)
    ecotaxa_counts = counts_from_ecotaxa(ecotaxa_tsv)

    print()
    print(f"  EcoTaxa total: {sum(ecotaxa_counts.values()):>15,}  ({len(ecotaxa_counts)} instruments)")
    print(f"  Report total:  {sum(report_counts.values()):>15,}  ({len(report_counts)} instruments)")

    final = combine(ecotaxa_counts, report_counts)
    print(f"  Combined max:  {sum(final.values()):>15,}  ({len(final)} instruments after 'Other' collapse)")
    print()

    if args.no_write:
        print("(dry run — not writing files)")
        for instr, n in final.items():
            print(f"  {instr:<20} {n:>15,}")
        return

    csv_path = write_csv(final, datetime.now())
    update_filelist(csv_path.name)


if __name__ == "__main__":
    main()
