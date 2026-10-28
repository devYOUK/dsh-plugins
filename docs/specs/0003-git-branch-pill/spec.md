---
id: 0003
title: Git 分支速览
status: done
created: 2026-10-28
updated: 2026-10-28
packages: [packages/git-branch-pill]
---

# 0003 · Git 分支速览

## 背景与问题

写代码时经常要确认“现在在哪个分支、这个会话改了多少”。切到终端跑 `git status` 会打断对话；宿主的输入框状态行只有轮次、缓存命中和上下文，没有仓库信息。需要把当前分支和一个改动概览放到输入框旁边，随时能看一眼。

## 目标

- 在输入框状态行（`13 轮 150 步` 那一行）左侧显示当前分支名与分支图标。
- 点击后弹出面板，显示分支、新增行数、删除行数、未跟踪文件数。
- 数据来自会话工作目录所在仓库：子目录会话也能定位到仓库根。
- detached HEAD 显示短 SHA；非 git 仓库或无会话目录时给出可见的降级状态。
- 面板可随时刷新，且不会阻塞输入。

## 非目标

- 不做提交、暂存、切换分支、推送等写操作，只读。
- 不列出逐个改动文件，也不做 diff 预览。
- 不跨仓库聚合，一个会话只对应一个工作目录。
- 不持久化面板开合状态，刷新页面后默认收起。

## 行为与验收

| # | 行为 | 验收 |
|---|---|---|
| 1 | 会话工作目录是 git 仓库时，状态行显示分支名与图标 | pill 出现在轮次/缓存 pill 左侧 |
| 2 | detached HEAD 显示 7 位短 SHA，而不是空白 | `git checkout <sha>` 后 pill 显示短 SHA |
| 3 | 点击 pill 弹出面板：分支、新增 `+n`、删除 `−n`、未跟踪 `n 个文件` | 面板各行与 `git status` 数字一致 |
| 4 | 点击外部或按 `Esc` 关闭面板 | 两种方式都能关闭 |
| 5 | 每 8 秒自动刷新一次；打开面板时立即刷新 | 改动文件后数字在刷新周期内变化 |
| 6 | 非 git 仓库 / 拿不到会话目录时，pill 显示 `?`，悬停提示错误码（如 `not-a-git-repo`） | 在非仓库目录开新会话可见 |
| 7 | 会话开在仓库子目录时，仍显示该仓库的分支与统计 | 在 `packages/xxx` 下开会话验证 |
| 8 | 仓库还没有首个提交时，统计暂存区改动而不是报错 | `git init` 后 `git add` 可见数字 |
| 9 | 未跟踪目录按文件展开计数（`-uall`），不折叠成一个目录 | 新增目录下多个文件时计数等于文件数 |
| 10 | Host 的 Remote 不可用时，退化为读 `.git/HEAD` 只显示分支，面板给出错误说明 | 关掉 Host 半侧后仍能看到分支名 |

## 影响面与风险

- slot：`conversation.composer.dock`，`order: -1`；内置活动 pill 是 `0`、用量 pill 是 `1`，所以本 pill 在最左。
- Host：`gitPill` 命名空间的 Typert Remote 服务，方法 `stats`；`inject: ['sessions']`，从 `sessions.get(id).header.cwd` 取工作目录，必要时回退遍历 `sessions.list()`。
- Client inject：`slots`、`connection`、`remote`、`remote.workspaceFiles`；调用 `rpc.call('/api', 'gitPill/stats', { args: { request: { sessionId } } })`。
- git 调用：`rev-parse --show-toplevel`、`symbolic-ref --short -q HEAD`、`rev-parse --short HEAD`、`diff HEAD --numstat`（无 HEAD 时 `diff --cached --numstat`）、`status --porcelain -uall`；5 秒超时、8MB 输出上限、`GIT_TERMINAL_PROMPT=0`、`LC_ALL=C`。
- 风险：机器没有 git 可执行文件时错误会被归为 `not-a-git-repo`，提示不精确；大仓库 `status -uall` 有成本，靠 8 秒轮询间隔与超时兜底；每会话一个定时器，会话多时 git 进程数随会话数增长。
- 回滚：关闭插件行或卸载 bundle；Host 服务与 pill 一起消失，不写任何仓库状态。

## 开放问题

- [ ] 面板是否增加“最近一次提交”或变更文件数。
- [ ] 轮询间隔是否跟随面板开合（收起时降频）。
