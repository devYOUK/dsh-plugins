---
id: spec-0004
updated: 2026-11-13
---

# 上线

## 上线增量

- 新增 `@local/dsh-workspace-menu`：工作区行右键菜单、打开目录、收藏、重命名。

## 验证

- 右键工作区行出现三项菜单；打开目录、重命名可用。
- 收藏后名称蓝色加粗，刷新后仍在。

## 回滚

- 关闭插件行或 `dsh plugin --profile desktop remove @local/dsh-workspace-menu`。
- 收藏数据留在浏览器 `localStorage`，卸载后不再生效；需要时清理 `dsh-workspace-menu:favorites`。

## 发布与部署

- 版本：0.1.0，本地 profile 链接安装。
- 部署事实见 `docs/deploy/`。
