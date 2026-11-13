---
id: ADR-0001
title: 采用 Spec-to-Delivery 文档工作流
status: accepted
date: 2026-11-13
scope: docs
---

# ADR-0001 · 采用 Spec-to-Delivery 文档工作流

## 背景

仓库原先用自建的 SDD：`docs/specs/<NNNN>-<slug>/{spec,plan,tasks}.md`，状态为 draft/approved/implementing/done，配 `scripts/spec-*.mjs` 与手写看板。它记录了 4 个已交付插件，但缺少尺寸分诊、人工门禁、验收证据与 reference 时效。

## 决策

改用 Spec-to-Delivery：

- 每份需求七件套，放在 `docs/spec/spec-NNNN-<slug>/`。
- 状态 `draft → G1…G6 → released`，S/M/L 决定哪些门禁必须人工批准。
- 索引由 `gen_spec_index.py` 生成，不再手写看板。
- 稳定事实进 `docs/reference/`，架构取舍进 `docs/decisions/`。

原有 4 份规格补录为 S2D 结构，Gate 记录依据对话与提交历史，标注「补录」。

## 影响

- 删除旧 `docs/specs/`、`docs/BOARD.md`、`scripts/spec-check.mjs`、`scripts/spec-new.mjs`。
- `npm run spec:*` 换成 `docs:check` / `docs:index`。
- AGENTS.md 指向 `docs/spec-workflow.md` 与 `docs/spec/README.md`。
