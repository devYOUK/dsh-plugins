---
id: 0003
updated: 2026-10-28
---

# 0003 · 任务

## 任务

- [x] Host `gitPill.stats` 服务与 Typert Remote 标记
- [x] 会话工作目录解析与仓库根定位（子目录可用）
- [x] 分支读取与 detached HEAD 短 SHA 回退
- [x] 新增/删除行数统计（含无 HEAD 的暂存回退）
- [x] 未跟踪文件计数（`-uall`，不折叠目录）
- [x] 输入框状态行的 pill（图标 + 分支名）
- [x] 点击面板：分支/新增/删除/未跟踪，成功与错误两种形态
- [x] 外部点击与 `Esc` 关闭面板
- [x] 8 秒轮询与打开时刷新，卸载清理定时器
- [x] Remote 不可用时读 `.git/HEAD` 的降级路径
- [x] 错误码与悬停提示（`session-required` / `cwd-unavailable` / `not-a-git-repo` / `git-error`）
