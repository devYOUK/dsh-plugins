---
id: spec-0004
updated: 2026-11-13
---

# 验收

## 环境

- DSH 桌面版，profile `desktop`，Windows。
- 包：`packages/workspace-menu` 0.1.0（profile 链接）。

## 证据

- 模块冒烟测试：factory 注册、`inject` 列表、`apply` 注册到 `shell.overlay#workspace-menu` 通过。
- `shell.overlay` 中 `workspace-menu` 注册 active；把 `order` 20→21 后 inspect 立即读到 21，确认客户端热替换生效（已改回 20）。
- `npm run check`、S2D 文档检查通过。
- 用户后续提出「收藏」「名称加粗」改进，说明菜单已在使用。

## 结论

通过。右键弹出、菜单项点击、Explorer 打开、重命名对话框与收藏染色未做端到端自动化验证，依赖用户实机使用。
