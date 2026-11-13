---
id: spec-0001
updated: 2026-11-13
---

# 验收

## 环境

- DSH 桌面版，profile `desktop`，Windows。
- 包：`packages/chat-search` 0.1.0（profile 链接）。

## 证据

- `npm run check`：`chat-search/index.js`、`chat-search/client.js` 通过。
- 表单模型断言：暂存、保存、恢复默认、冲突、只读、非法输入等 29 条通过。
- 搜索范围断言：user / steering / assistant-step / reasoning / tool-call / compact answer 分类通过。
- Slot：`conversation.session.header.utilities` 与 `plugins.row.config` 的注册 active。
- 配置写入证据：profile patch 中出现 `- id: chat-search` 且保存过 `transparencyPercent` / `blurPx`。

## 结论

通过。搜索条高亮与键盘导航未做端到端自动化验证，依赖用户实机使用；配置页在用户操作中已验证可保存。
