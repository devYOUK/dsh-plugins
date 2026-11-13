---
id: spec-0003
updated: 2026-11-13
---

# 上线

## 上线增量

- 新增 `@local/dsh-git-branch-pill` bundle：状态行分支 pill、改动面板、Remote `gitPill.stats`。

## 验证

- 状态行出现分支 pill；点击面板数字与 `git status` 一致。
- 非仓库目录显示红字错误码。

## 回滚

- 关闭插件行或 `dsh plugin --profile desktop remove @local/dsh-git-branch-pill`。
- Host 服务与 pill 一起消失，不写仓库状态、不残留配置。

## 发布与部署

- 版本：0.1.0，本地 profile 链接安装。
- 部署事实见 `docs/deploy/`。
