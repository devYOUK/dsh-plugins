---
id: ADR-0002
title: 工作区菜单使用行属性钩子
status: accepted
date: 2026-11-13
scope: workspace-menu
---

# ADR-0002 · 工作区菜单使用行属性钩子

## 背景

宿主的工作区浏览器（`sidebar.workspaces`）是单个 slot，没有工作区行的菜单扩展点；重画整个浏览器成本过高。

## 决策

- 插件注册 `shell.overlay`，在文档捕获阶段监听 `contextmenu`。
- 命中工作区行时读取 `data-row-key="workspace:<workspaceId>"` 定位工作区。
- 收藏状态存在浏览器 `localStorage`，通过给行加 `data-workspace-favorite="true"` 并用 CSS 选择器改标题样式。

## 影响

- 依赖宿主 DOM 属性与标题 class 含 `title`；宿主改版可能让菜单或染色静默失效。
- 收藏按浏览器来源隔离，不跨设备/端口。
- 换到正式 slot 后可移除本 ADR 的临时约束。
