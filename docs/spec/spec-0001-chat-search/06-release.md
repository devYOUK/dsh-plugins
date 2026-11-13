---
id: spec-0001
updated: 2026-11-13
---

# 上线

## 上线增量

- 新增 `@local/dsh-chat-search` bundle：会话内搜索、配置页、历史记录。

## 验证

- 插件页显示「对话内搜索」且行已启用。
- `Ctrl+F` 可打开搜索条并高亮命中；配置页三个字段可保存。

## 回滚

- 关闭插件行或 `dsh plugin --profile desktop remove @local/dsh-chat-search`。
- 配置留在 `.dsh/profiles/<profile>/cordis.patch.yml` 的 `- id: chat-search` 段，可按需手动删除。
- 浏览器历史留在 `localStorage` 的 `dsh-chat-search:history`。

## 发布与部署

- 版本：0.1.0，本地 profile 链接安装，未发布到注册表。
- 部署事实（profile 路径、启动方式）见 `docs/deploy/`；本文件不重复。
