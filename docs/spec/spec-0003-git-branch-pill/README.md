---
id: spec-0003
slug: git-branch-pill
title: Git 分支速览
size: S
size_reason: 单个插件的只读展示与一个内网 Remote 方法，无数据库/公开契约变更，关闭插件行即可回滚。
status: released
release: 0.1.0
owner: "@sutpc"
created: 2026-10-28
updated: 2026-11-13
---

# spec-0003 · Git 分支速览

在输入框状态行左侧显示当前分支；点击查看新增、删除、未跟踪文件数。

## 范围

- 做：分支与改动概览、子目录会话定位仓库根、detached HEAD、错误态展示。
- 不做：提交/暂存/切换分支、逐文件列表、跨仓库聚合。

## Gate log

| Gate | 日期 | 结论 | 审批 | 证据 |
|---|---|---|---|---|
| G1 | 2026-10-28 | S：单插件只读展示 + 内网 Remote | 自检 | 本文件与 [01](01-requirement.md) |
| G2 | 2026-10-28 | 需求确认（补录） | 用户（对话） | [01](01-requirement.md) 验收标准 |
| G3 | — | S 级 N/A；Remote 与统计取舍记入 [03](03-decision.md) | — | [03](03-decision.md) |
| G4 | 2026-10-28 | 实现与自测完成 | 自检 | [04](04-task.md)、[05](05-acceptance.md) |
| G5 | 2026-11-13 | 验收通过（用户明确认可全部 spec） | 用户（对话） | [05](05-acceptance.md) |
| G6 | — | S 级 N/A；本地安装 | — | [06](06-release.md) |

## 文档

- [01 需求](01-requirement.md)
- [02 方案](02-plan.md)
- [03 决策](03-decision.md)
- [04 任务](04-task.md)
- [05 验收](05-acceptance.md)
- [06 上线](06-release.md)
