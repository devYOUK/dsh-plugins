# workspace-menu 实现说明

面向维护者；用户文档见根目录 README，行为规格见 [`../spec/spec-0004-workspace-menu/README.md`](../spec/spec-0004-workspace-menu/README.md)。

## 插槽与触发

- 注册 `shell.overlay` 的条目 `id: workspace-menu`（list、root 作用域，`order: 20`）。overlay 本身点击穿透，菜单与对话框各自把 `pointerEvents` 打开。
- 组件在捕获阶段监听 `document` 的 `contextmenu`。只有 `event.target.closest('[data-row-key^="workspace:"]')` 命中时才 `preventDefault()` 并打开菜单；其他地方直接返回，保留浏览器/宿主原本的右键行为。
- `data-row-key` 的格式是 `workspace:<workspaceId>`，由 `ui-workspace` 的工作区行写入。宿主改版丢掉这个属性时插件会静默失效，不会拦截其他区域的右键。
- 工作区数据取自 slot 标准 prop 的 `useWorkspaces` 快照，按 id 找到 `path` 与 `title`。

## 动作

- 打开目录：`ctx.remote.session.openWorkspacePath({ path })`，返回 `{ ok: true }` 信封；失败可能是 `ok: false` 或抛错，两种都转成底部 toast。该 Remote 要求 Host 能把路径映射到本机，远程/容器部署会被拒绝。
- 收藏：工作区 id 数组存在 `localStorage` 的 `dsh-workspace-menu:favorites`。收藏时给行元素加 `data-workspace-favorite="true"`，注入的样式 `[data-workspace-favorite="true"] [class*="title"]{color:var(--dsw-alias-state-business-primary);font-weight:600}` 把名称染成主题蓝并加粗；取消收藏移除属性。侧栏用 MutationObserver 监听，行重建后重新打标。
- 重命名：自绘对话框（`role="dialog"`），输入框预填当前标题并聚焦，提交调用 `ctx.workspaces.rename(workspaceId, title)`；空白值禁用提交，服务失败时保留对话框并在下方显示原因。

## 关闭与提示

菜单在菜单外 `pointerdown`、`Escape`、捕获阶段 `scroll`、`resize`、`window.blur` 时关闭；重命名对话框由 `Escape`、点遮罩或取消按钮关闭。toast 4 秒后自动消失。

## 风险

- 依赖宿主 DOM 属性而非公开 slot；升级后若 `data-row-key` 改名，右键菜单不再出现。
- 收藏染色依赖工作区标题元素的 class 含 `title`（CSS Modules 产物形如 `_title_xxx_1`）。宿主的命名策略改变时颜色会失效，但收藏数据仍保留在 localStorage。
- 重命名绕过宿主自己的重命名对话框，因此没有重名/默认名称校验；需要时由 `workspaces.rename` 的 Host 侧规则兜底。
- 菜单层级 `z-index: 1200`，重命名遮罩 `1300`，toast `1400`；宿主若新增更高层浮层需同步调整。
