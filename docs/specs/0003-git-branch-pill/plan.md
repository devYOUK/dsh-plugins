---
id: 0003
updated: 2026-10-28
---

# 0003 · 实现方案

## 方案

Host 半侧是一个 `TypertRemoteService` 子类，注册在 `gitPill` 命名空间；客户端通过共享 Remote 传输直接调用 `/api` 上的 `gitPill/stats`，不新增 HTTP 路由。

- 工作目录解析：`sessions.get(id).header.cwd`，取不到时遍历 `sessions.list()` 匹配 id；再用 `git rev-parse --show-toplevel` 归一化到仓库根，所以子目录会话也能工作。
- 分支：`symbolic-ref --short -q HEAD` 成功即分支名；失败再 `rev-parse --short HEAD` 得到 detached 的短 SHA。
- 统计：有 HEAD 时 `git diff HEAD --numstat`；没有 HEAD（新仓库）时用 `git diff --cached --numstat`，把两次 numstat 的行数相加；未跟踪用 `status --porcelain -uall` 数 `?? ` 行。
- 每个 git 命令 5 秒超时、8MB 上限、禁用交互提示，失败时返回 `{ ok: false, error: { code } }` 而不是抛错。

客户端：

- pill 注册进 `conversation.composer.dock`（`order: -1`），作为普通按钮；首次取数成功前不渲染，避免闪现。
- 面板是 `position: fixed` 的对话框，定位用按钮的 `getBoundingClientRect()`（左对齐、底边在按钮上方 8px），不参与输入框布局。
- 开合只由本地 state 控制：外部 `pointerdown` 或 `Escape` 关闭；打开时触发一次刷新。
- 轮询用 `setInterval(8000)`，卸载时清理。
- Remote 失败时回退读 `.git/HEAD`：处理 `gitdir:` 指向 worktree 的情况，缺统计字段时面板只显示分支和错误行。

被否掉的方案：给面板加逐文件列表——需要额外 Remote 与虚拟滚动，超出“速览”的范围。

## 接口与数据

- Remote：`gitPill.stats(request: { sessionId })`，返回 `{ ok: true, value: { root, branch, detached, insertions, deletions, untracked } }` 或 `{ ok: false, error: { code: 'session-required' | 'cwd-unavailable' | 'not-a-git-repo' | 'git-error', message } }`。
- 协议标记：TS 装饰器不可用，直接在原型上写入 `@deepseek-ai/dsh-typert-protocol/remote-methods`（`version: 1`，`stats` 为 direct 调用）。
- slot：`conversation.composer.dock`，`id: 'git-branch-pill'`，`order: -1`。
- 客户端 inject：`slots`、`connection`、`remote`、`remote.workspaceFiles`；Host `inject: ['sessions']`。
- 无 Config、无持久化；面板样式取自内置“会话统计”对话框的 token。

## 测试与验证

- 结构：`npm run check`、`npm run spec:check`。
- 行为断言：`sumNumstat` 对 `-`（二进制文件）不计数、多行求和；`parseRef` 处理 `ref:` 与 40 位 SHA；`cwdOf` 处理 `header.cwd` 缺失。
- 实机验证：普通分支 / detached HEAD / 子目录会话 / 新仓库 / 非仓库目录 / 未跟踪目录；面板的开合与刷新。
- 已知未覆盖：没有 git 可执行文件的环境，错误码会退化为 `not-a-git-repo`。
