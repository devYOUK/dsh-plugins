#!/usr/bin/env python3
"""根据各 spec 的 README front matter 生成 docs/spec/README.md 的索引块。

只替换 <!-- spec-index:start --> 与 <!-- spec-index:end --> 之间的内容，
其余人工维护的说明文字保持不动。

用法：
  python scripts/gen_spec_index.py --root .
  python scripts/gen_spec_index.py --root . --check
"""
import argparse
import re
import sys
from pathlib import Path

START = "<!-- spec-index:start -->"
END = "<!-- spec-index:end -->"
STATUS_ORDER = ["draft", "G1", "G2", "G3", "G4", "G5", "G6", "released"]
STATUS_TEXT = {
    "draft": "起草中",
    "G1": "范围已确认",
    "G2": "需求已确认",
    "G3": "决策已确认",
    "G4": "实现与自测完成，待验收",
    "G5": "验收通过，待上线",
    "G6": "上线方案已确认，待发布",
    "released": "已发布",
}
SPEC_DIR = re.compile(r"^spec-(\d{4})-([a-z0-9]+(?:-[a-z0-9]+)*)$")


def parse_front_matter(path: Path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    lines = text.splitlines()
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return {}
    data = {}
    for line in lines[1:end]:
        if line[:1].isspace() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip("\"'")
    return data


def collect(spec_root: Path, warnings):
    rows = []
    for item in sorted(spec_root.iterdir()):
        if not item.is_dir() or not item.name.startswith("spec-"):
            continue
        if not SPEC_DIR.match(item.name):
            warnings.append(f"{item}: 目录名不符合 spec-<4 位数字>-<slug>，已跳过")
            continue
        readme = item / "README.md"
        if not readme.is_file():
            warnings.append(f"{item}: 缺少 README.md，已跳过")
            continue
        meta = parse_front_matter(readme)
        if not meta.get("id") or not meta.get("status"):
            warnings.append(f"{readme}: front matter 缺少 id 或 status，已跳过")
            continue
        rows.append(
            {
                "id": meta["id"],
                "dir": item.name,
                "title": meta.get("title", ""),
                "size": meta.get("size", ""),
                "status": meta.get("status", ""),
                "release": meta.get("release", ""),
            }
        )
    rows.sort(key=lambda r: r["id"])
    return rows


def render(rows):
    counts = {}
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + 1
    lines = [START, "## 状态看板", "", f"共 {len(rows)} 个需求。", ""]
    lines += ["| 状态 | 含义 | 数量 |", "| --- | --- | --- |"]
    for status in STATUS_ORDER:
        if not counts.get(status):
            continue
        lines.append(f"| {status} | {STATUS_TEXT.get(status, status)} | {counts[status]} |")
    for status in sorted(set(counts) - set(STATUS_ORDER)):
        lines.append(f"| {status} | 未知状态 | {counts[status]} |")
    lines += ["", "## 需求列表", ""]
    lines += ["| 编号 | 需求 | 级别 | 状态 | 版本 |", "| --- | --- | --- | --- | --- |"]
    for row in rows:
        lines.append(
            f"| [{row['id']}]({row['dir']}/README.md) | {row['title']} | "
            f"{row['size']} | {row['status']} | {row['release']} |"
        )
    lines.append(END)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate spec index from front matter.")
    parser.add_argument("--root", default=".", help="project root (default: .)")
    parser.add_argument("--check", action="store_true", help="只校验索引是否为最新，不写文件")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    index = root / "docs" / "spec" / "README.md"
    spec_root = index.parent
    if not index.is_file():
        print(f"ERROR: 找不到索引文件 {index}")
        return 1

    text = index.read_text(encoding="utf-8")
    if START not in text or END not in text:
        print(f"ERROR: {index} 缺少索引标记 {START} / {END}")
        return 1

    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)

    warnings = []
    rows = collect(spec_root, warnings)
    for warning in warnings:
        print(f"WARN  {warning}")

    new_text = head + render(rows) + tail
    if args.check:
        if new_text != text:
            print(f"ERROR: {index} 与 spec 状态不一致，请运行 gen_spec_index.py 更新")
            return 1
        print(f"索引已是最新：{len(rows)} 个需求")
        return 0

    if new_text == text:
        print(f"索引无变化：{len(rows)} 个需求")
        return 0
    with open(index, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(new_text)
    print(f"已更新 {index}：{len(rows)} 个需求")
    return 0


if __name__ == "__main__":
    sys.exit(main())
