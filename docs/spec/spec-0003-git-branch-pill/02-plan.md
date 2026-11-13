---
id: spec-0003
updated: 2026-11-13
---

# 方案

## 实现方案

Host 半侧是 `TypertRemoteService` 子类，注册在 `gitPill` 命名空间；客户端通过共享 Remote 传输调用 `gitPill/stats`，不新增 HTTP 路由。

- 工作目录：`sessions.get(id).header.cwd`，取不到时遍历 `sessions.list()`，再用 `git rev-parse --show-toplevel` 归一化到仓库根。
- 分支：`symbolic-ref --short -q HEAD`；失败回退 `rev-parse --short HEAD`。
- 统计：有 HEAD 时 `git diff HEAD --numstat`；无 HEAD 时 `git diff --cached --numstat`；未跟踪用 `status --porcelain -uall` 数 `?? `。
- 客户端：pill 注册进 `conversation.composer.dock`（`order: -1`），面板用按钮 rect 定位，打开/每 8 秒刷新，失败回退读 `.git/HEAD`。

## 接口与数据

- Remote：`gitPill.stats({ sessionId })` → `{ ok, value }` 或 `{ ok: false, error: { code } }`，错误码 `session-required` / `cwd-unavailable` / `not-a-git-repo` / `git-error`。
- 协议标记直接写在原型上（纯 JS 无装饰器）。
- 客户端 inject：`slots`、`connection`、`remote`、`remote.workspaceFiles`；Host `inject: ['sessions']`。
- 无 Config、无持久化。

## 测试与验证

- 结构：`npm run check`、S2D `docs:check`。
- 行为：`sumNumstat` 对二进制 `-` 不计数；`parseRef` 处理 `ref:` 与 SHA；`cwdOf` 处理缺失。
- 实机：普通分支 / detached / 子目录 / 新仓库 / 非仓库目录。
