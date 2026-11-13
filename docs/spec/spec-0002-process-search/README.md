---
id: spec-0002
slug: process-search
title: 折叠过程正文的搜索与自动展开
size: S
size_reason: 单插件内的搜索范围扩展，复用宿主 beforematch 揭示入口，无配置/数据/跨服务变更。
status: released
release: 0.1.0
owner: "@sutpc"
created: 2026-10-28
updated: 2026-11-13
---

# spec-0002 · 折叠过程正文的搜索与自动展开

在 0001 的基础上，让「过程」开关同时覆盖折叠的过程正文，并在定位命中时自动展开。

## 范围

- 做：折叠过程正文纳入搜索、命中时派生 `beforematch` 展开、失败剔除。
- 不做：展开整轮、搜索思考/工具输出、独立配置项。

## Gate log

| Gate | 日期 | 结论 | 审批 | 证据 |
|---|---|---|---|---|
| G1 | 2026-10-28 | S：单插件搜索范围扩展 | 自检 | 本文件与 [01](01-requirement.md) |
| G2 | 2026-10-28 | 需求确认：按推荐方案实施 | 用户（对话） | 「就按你推荐的来，实施吧」 |
| G3 | — | S 级 N/A；展开方式记入 [03](03-decision.md) | — | [03](03-decision.md) |
| G4 | 2026-10-28 | 实现与自测完成 | 自检 | [04](04-task.md)、[05](05-acceptance.md)、提交 `a59fa13` |
| G5 | 2026-11-13 | 验收通过（补录：插件在本地 profile 使用中） | 用户（对话） | [05](05-acceptance.md) |
| G6 | — | S 级 N/A；本地安装 | — | [06](06-release.md) |

## 文档

- [01 需求](01-requirement.md)
- [02 方案](02-plan.md)
- [03 决策](03-decision.md)
- [04 任务](04-task.md)
- [05 验收](05-acceptance.md)
- [06 上线](06-release.md)
