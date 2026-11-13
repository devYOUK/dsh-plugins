---
id: spec-0001
slug: chat-search
title: 对话内搜索
size: S
size_reason: 单个插件内的 UI 与设置行为，无数据库、公开 API 或跨服务影响，关闭插件行即可回滚。
status: released
release: 0.1.0
owner: "@sutpc"
created: 2026-10-27
updated: 2026-11-13
---

# spec-0001 · 对话内搜索

在当前会话正文里按 `Ctrl+F` 搜索关键词，高亮命中并前后跳转；搜索条外观可在插件详情页配置。

## 范围

- 做：会话内搜索、匹配选项、历史、外观配置。
- 不做：跨会话搜索、替换、搜索附件/图片。

## Gate log

| Gate | 日期 | 结论 | 审批 | 证据 |
|---|---|---|---|---|
| G1 | 2026-10-27 | S：单插件 UI，无外部契约 | 自检 | 本文件与 [01](01-requirement.md) |
| G2 | 2026-10-27 | 需求确认（补录） | 用户（对话） | [01](01-requirement.md) 验收标准 |
| G3 | — | S 级 N/A；局部取舍记入 [03](03-decision.md) | — | [03](03-decision.md) |
| G4 | 2026-10-28 | 实现与自测完成 | 自检 | [04](04-task.md)、[05](05-acceptance.md)、提交 `5d1382d` |
| G5 | 2026-11-13 | 验收通过（补录：插件在本地 profile 使用中） | 用户（对话） | [05](05-acceptance.md) |
| G6 | — | S 级 N/A；本地安装，无独立上线方案 | — | [06](06-release.md) |

## 文档

- [01 需求](01-requirement.md)
- [02 方案](02-plan.md)
- [03 决策](03-decision.md)
- [04 任务](04-task.md)
- [05 验收](05-acceptance.md)
- [06 上线](06-release.md)
