---
id: spec-0004
updated: 2026-11-13
---

# 方案

## 实现方案

1. 注册 `shell.overlay` 条目 `workspace-menu`（list、root 作用域）。
2. 组件在捕获阶段监听 `document` 的 `contextmenu`，只处理 `event.target.closest('[data-row-key^="workspace:"]')`；从属性取 `workspaceId`，在 `useWorkspaces` 快照里找到 `path` 与 `title`。
3. 菜单是 fixed 面板，坐标按视口夹紧；overlay 点击穿透，菜单自身打开 `pointerEvents`。
4. 打开目录调用 `ctx.remote.session.openWorkspacePath({ path })`，失败转底部 toast。
5. 收藏存 `localStorage` 的 `dsh-workspace-menu:favorites`；给行加 `data-workspace-favorite="true"`，注入 CSS 把标题染主题蓝并加粗；MutationObserver 在行重建后重新打标。
6. 重命名走自绘对话框，提交 `ctx.workspaces.rename(workspaceId, title)`。

## 接口与数据

- `ctx.remote.session.openWorkspacePath({ path })` → `{ ok }` 信封。
- `ctx.workspaces.rename(workspaceId, title)` → `WorkspaceView`。
- DOM：`data-row-key`、`data-workspace-favorite`、`[class*="title"]`。
- 样式：`color: var(--dsw-alias-state-business-primary); font-weight: 600`。

## 测试与验证

- 模块冒烟：factory 注册、inject 列表、apply 注册到 `shell.overlay#workspace-menu`。
- 结构：`npm run check`、S2D `docs:check`。
- 实机：右键菜单、打开目录、重命名、收藏染色；无浏览器控制时只验证注册与热替换。
