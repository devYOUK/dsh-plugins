#!/usr/bin/env python3
"""S2D docs consistency checker.

Portable: Python 3 stdlib only. Defaults to <root>/docs.

同时校验 docs/decisions 的 ADR：编号与文件名一致、状态合法、取代关系可解析、索引齐全。
"""
import argparse
import re
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import unquote

STATUSES = {"draft", "G1", "G2", "G3", "G4", "G5", "G6", "released"}
SIZES = {"S", "M", "L"}
SPEC_DIR = re.compile(r"^spec-(\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
ADR_STATUSES = {"proposed", "accepted", "superseded", "deprecated"}
ADR_FILE = re.compile(r"^ADR-(\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$")


def parse_front_matter(path: Path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}, text
    lines = text.splitlines()
    if len(lines) < 3:
        return {}, text
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return {}, text
    data = {}
    current_list = None
    for line in lines[1:end]:
        if not line.strip():
            continue
        if line[:1].isspace() or line.lstrip().startswith("-"):
            if current_list:
                value = line.strip()
                if value.startswith("-"):
                    value = value[1:].strip().strip('"\'')
                    if value:
                        data[current_list].append(value)
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"\'')
        if value:
            data[key] = value
            current_list = None
        else:
            data[key] = []
            current_list = key
    return data, "\n".join(lines[end + 1:])


def as_date(value):
    if not value or not DATE.match(value):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def require(mapping, keys, where, errors):
    for key in keys:
        if key not in mapping or mapping[key] in (None, "", []):
            errors.append(f"{where}: missing front matter '{key}'")


def check_specs(docs: Path, errors, warnings):
    spec_root = docs / "spec"
    if not spec_root.is_dir():
        errors.append(f"{spec_root}: spec directory not found")
        return 0
    required = ["README.md", "01-requirement.md", "02-plan.md", "03-decision.md",
                "04-task.md", "05-acceptance.md", "06-release.md"]
    count = 0
    for item in sorted(spec_root.iterdir()):
        if not item.is_dir() or not item.name.startswith("spec-"):
            continue
        count += 1
        match = SPEC_DIR.match(item.name)
        if not match:
            errors.append(f"{item}: directory must be spec-<4 digits>-<slug>")
            continue
        for name in required:
            if not (item / name).is_file():
                errors.append(f"{item}: missing {name}")
        readme = item / "README.md"
        if not readme.is_file():
            continue
        meta, _ = parse_front_matter(readme)
        require(meta, ["id", "slug", "status", "size", "size_reason", "release"], str(readme), errors)
        if meta.get("id") != f"spec-{match.group(1)}":
            errors.append(f"{readme}: id must be spec-{match.group(1)}")
        if meta.get("slug") != match.group(2):
            errors.append(f"{readme}: slug must be {match.group(2)}")
        if meta.get("status") not in STATUSES:
            errors.append(f"{readme}: invalid status {meta.get('status')!r}")
        if meta.get("size") not in SIZES:
            errors.append(f"{readme}: size must be S/M/L")
    return count


def check_references(docs: Path, today: date, errors, warnings):
    ref_root = docs / "reference"
    if not ref_root.is_dir():
        warnings.append(f"{ref_root}: reference directory missing")
        return 0
    count = 0
    for path in sorted(ref_root.rglob("*.md")):
        if path.name == "README.md":
            continue
        count += 1
        meta, _ = parse_front_matter(path)
        require(meta, ["owner", "last_verified", "review_interval_days", "source"], str(path), errors)
        verified = as_date(meta.get("last_verified"))
        if verified is None:
            errors.append(f"{path}: last_verified must be YYYY-MM-DD")
            continue
        try:
            interval = int(meta.get("review_interval_days"))
        except (TypeError, ValueError):
            errors.append(f"{path}: review_interval_days must be an integer")
            continue
        age = (today - verified).days
        if age > interval:
            errors.append(f"{path}: stale ({age} days > {interval}); re-verify or archive")
        elif age < 0:
            warnings.append(f"{path}: last_verified is in the future")
    return count


def check_adrs(docs: Path, errors, warnings):
    adr_root = docs / "decisions"
    if not adr_root.is_dir():
        return 0
    index = adr_root / "README.md"
    index_text = index.read_text(encoding="utf-8") if index.is_file() else ""
    if not index_text:
        errors.append(f"{index}: ADR index missing")
    count = 0
    ids = {}
    for path in sorted(adr_root.glob("*.md")):
        if path.name == "README.md":
            continue
        match = ADR_FILE.match(path.name)
        if not match:
            errors.append(f"{path}: ADR filename must be ADR-NNNN-kebab-case.md")
            continue
        count += 1
        meta, _ = parse_front_matter(path)
        require(meta, ["id", "title", "status", "date", "scope"], str(path), errors)
        expected = f"ADR-{match.group(1)}"
        if meta.get("id") and meta.get("id") != expected:
            errors.append(f"{path}: id must be {expected}")
        ids[expected] = path
        if meta.get("status") and meta["status"] not in ADR_STATUSES:
            errors.append(f"{path}: invalid ADR status {meta.get('status')!r}")
        if meta.get("date") and as_date(meta.get("date")) is None:
            errors.append(f"{path}: date must be YYYY-MM-DD")
        if index_text and path.name not in index_text:
            errors.append(f"{path}: not listed in decisions/README.md")
    for path in ids.values():
        meta, _ = parse_front_matter(path)
        for key in ("supersedes", "superseded_by"):
            value = meta.get(key)
            if not value or value == "null":
                continue
            for ref in re.split(r"[, ]+", value if isinstance(value, str) else ""):
                ref = ref.strip()
                if ref == "ADR-" + path.name[4:8]:
                    errors.append(f"{path}: {key} references itself")
                elif ref and ref != "null" and ref not in ids:
                    errors.append(f"{path}: {key} references unknown {ref}")
        if meta.get("status") == "superseded" and not meta.get("superseded_by"):
            warnings.append(f"{path}: superseded without superseded_by")
    return count

def check_links(docs: Path, errors):
    checked = 0
    for path in sorted(docs.rglob("*.md")):
        if "_templates" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        for raw in LINK.findall(text):
            target = raw.strip()
            if not target or target.startswith(("http://", "https://", "mailto:", "#", "/", "<")):
                continue
            target = target.split("#", 1)[0].split("?", 1)[0]
            if not target or target.startswith(("...", "{")):
                continue
            target = unquote(target)
            dest = (path.parent / target).resolve()
            checked += 1
            if not dest.exists():
                errors.append(f"{path}: broken link -> {raw}")
    return checked


def main():
    parser = argparse.ArgumentParser(description="Check S2D docs structure, freshness and links.")
    parser.add_argument("--root", default=".", help="project root (default: .)")
    parser.add_argument("--docs", default=None, help="docs directory, relative to root or absolute")
    parser.add_argument("--check-links", action="store_true", help="check relative markdown links")
    parser.add_argument("--today", default=None, help="override today YYYY-MM-DD (testing)")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    docs = Path(args.docs) if args.docs else root / "docs"
    if not docs.is_absolute():
        docs = root / docs
    if not docs.is_dir():
        print(f"ERROR: docs directory not found: {docs}")
        return 1

    today = as_date(args.today) if args.today else date.today()
    if today is None:
        print("ERROR: --today must be YYYY-MM-DD")
        return 1

    errors, warnings = [], []
    specs = check_specs(docs, errors, warnings)
    refs = check_references(docs, today, errors, warnings)
    adrs = check_adrs(docs, errors, warnings)
    links = check_links(docs, errors) if args.check_links else 0

    for warning in warnings:
        print(f"WARN  {warning}")
    for error in errors:
        print(f"ERROR {error}")
    print(f"checked specs={specs} references={refs} adrs={adrs} links={links} errors={len(errors)} warnings={len(warnings)}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
