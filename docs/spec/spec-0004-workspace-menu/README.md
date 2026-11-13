---
id: spec-0004
slug: workspace-menu
title: 工作区右键菜单
size: S
size_reason: 单插件内的侧栏交互与浏览器本地收藏，无数据库/公开 API/跨服务影响，卸载即回滚。
status: released
release: 0.1.0
owner: "@sutpc"
created: 2026-11-02
updated: 2026-11-13
---

# spec-0004 · 工作区右键菜单

在工作区行上右键：用文件资源管理器打开、添加/移除收藏、重命名。

## 范围

- 做：右键菜单、打开目录、收藏（名称蓝字加粗）、重命名。
- 不做：删除/排序/新建工作区、会话行菜单、键盘菜单导航。

## Gate log

| Gate | 日期 | 结论 | 审批 | 证据 |
|---|---|---|---|---|
| G1 | 2026-11-02 | S：单插件侧栏交互 | 自检 | 本文件与 [01](01-requirement.md) |
| G2 | 2026-11-02 | 需求确认（补录：用户提出右键菜单需求） | 用户（对话） | [01](01-requirement.md) 验收标准 |
| G3 | — | S 级 N/A；DOM 钩子与存储取舍记入 [03](03-decision.md) | — | [03](03-decision.md) |
| G4 | 2026-11-02 | 实现与自测完成 | 自检 | [04](04-task.md)、[05](05-acceptance.md)、提交 `77c12c9` |
| G5 | 2026-11-13 | 验收通过（补录：用户连续提出收藏/加粗改进并在使用） | 用户（对话） | [05](05-acceptance.md) |
| G6 | — | S 级 N/A；本地安装 | — | [06](06-release.md) |

## 文档

- [01 需求](01-requirement.md)
- [02 方案](02-plan.md)
- [03 决策](03-decision.md)
- [04 任务](04-task.md)
- [05 验收](05-acceptance.md)
- [06 上线](06-release.md)
