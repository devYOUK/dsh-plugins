---
id: 0004
updated: 2026-11-02
---

# 0004 · 实现方案

## 方案

一个纯 Client 插件，挂在 `shell.overlay`：

1. 组件在 `useEffect` 里给 `document` 挂一个捕获阶段的 `contextmenu` 监听。命中 `event.target.closest('[data-row-key^="workspace:"]')` 时，从属性取出 `workspaceId`，在 `useWorkspaces` 快照里找到对应 `WorkspaceView`，`preventDefault()` 后把菜单坐标与工作区存进 state。
2. 菜单是 `position: fixed` 的面板，坐标按视口宽高夹紧；面板 `pointerEvents: auto`，其余 overlay 仍然点击穿透。
3. 「用文件资源管理器打开」调用 `ctx.remote.session.openWorkspacePath({ path: workspace.path })`：省略 `action` 时按目录关联打开（Windows 下即 Explorer）。信封 `ok !== true` 或调用抛错都走失败提示。
4. 「重命名」打开自绘对话框：输入框预填当前标题并自动聚焦，确认后 `ctx.workspaces.rename(workspaceId, next)`。空白值禁用提交；服务失败时保留对话框并显示原因。
5. 关闭菜单：文档 `pointerdown`（菜单外）、`Escape`、捕获阶段的 `scroll`、`resize`、`window.blur`。
6. 失败提示是一个位于 overlay 底部的小 toast，4 秒后自动消失。

备选方案一：用 DOM 点击宿主的「…」菜单再点重命名——要模拟两次点击且依赖菜单结构，放弃。备选方案二：替换 `sidebar.workspaces` 重画整个浏览器——成本与风险都远超需求，放弃。

## 接口与数据

- Slot：`shell.overlay`（list，root），注册 `id: workspace-menu`。
- 宿主 DOM 契约：`data-row-key="workspace:<workspaceId>"`；找不到这个属性时监听器直接返回，不阻止默认行为。
- 服务依赖：`slots`、`workspaces`、`remote`、`remote.session`、`locale`。
- `ctx.workspaces.rename(workspaceId, title): Promise<WorkspaceView>`。
- `ctx.remote.session.openWorkspacePath({ path }): Promise<{ ok: true, value } | { ok: false, error }>`；只在确认目录路径可映射到 Host 本机时成功。
- 无 Config、无持久化；菜单语言走 `locale` 命名空间 `workspace.menu`（zh/en）。

## 测试与验证

- 结构：`npm run check`、`npm run spec:check`。
- 行为断言：纯逻辑部分（菜单坐标夹紧、`data-row-key` 解析、空白标题判定）可用临时脚本覆盖。
- 实机验证：右键工作区行弹菜单；打开 Explorer；重命名后侧栏标题变化；`Esc`/外部点击/滚动关闭。无浏览器控制时只验证模块加载与 slot 注册，并报告实机未验证。
