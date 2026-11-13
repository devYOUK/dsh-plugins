---
owner: "@sutpc"
last_verified: 2026-11-13
review_interval_days: 90
source:
  - "app.asar/dsh/node_modules/@deepseek-ai/dsh-client-ui-workspace/lib/client.js"
  - "app.asar/dsh/node_modules/@deepseek-ai/dsh-client-ui-settings/lib/client.js"
  - "app.asar/dsh/node_modules/@deepseek-ai/dsh-api-remotes/lib/*"
  - "cordis_inspect_query：Slots / Service / Config"
---

# DSH 客户端契约速查

本仓库插件依赖的宿主表面。核对日期 2026-11-13；超过 90 天需重新验证。

## Slots

| Slot | 用途 | 注册形态 |
|---|---|---|
| `conversation.session.header.utilities` | 会话头部按钮 | list |
| `conversation.composer.dock` | 输入框下方状态行 | list，按 `order` 排序 |
| `plugins.row.config` | 插件行配置页 | keyed，键 `<包名>#<行 id>` |
| `shell.overlay` | 全框浮层（菜单、toast、对话框） | list，点击穿透 |

## Services（Client）

| Service | 关键方法 |
|---|---|
| `ctx.configForms` | `get(entryId)` → 共享表单；`getSnapshot()` / `mutate(ops, revision)` |
| `ctx.workspaces` | `rename(workspaceId, title)`、`create({ path })` |
| `ctx.remote.session` | `openWorkspacePath({ path, action? })` → `{ ok }` 信封 |
| `ctx.locale` | `bind(ns)`、`register(ns, { zh, en })` |

## DOM 契约

| 选择器 / 属性 | 来源 | 用途 |
|---|---|---|
| `[data-chat-flow-kind]` | 会话转录 | `user` / `steering` / `assistant-step` / `tool-call` / `turn-process` |
| `[data-chat-group-part]` | 助手步骤 | `response` / `reasoning` |
| `[data-turn-process-member]` | 过程成员 | 区分过程说明与最终回答 |
| `hidden="until-found"` + `beforematch` | 折叠过程 | 隐藏可被搜索，派发事件展开 |
| `[data-row-key="workspace:<id>"]` | 侧栏工作区行 | 右键菜单命中与收藏打标 |
| `[class*="title"]` | 工作区标题 span | 收藏样式目标（CSS Modules 类名含 title） |

## 主题 token

- 主题蓝：`--dsw-alias-state-business-primary`（DeepSeek 蓝）。
- 文本：`--dsw-alias-label-primary/secondary/tertiary`。
- 表面：`--dsw-specific-menu`、`--dsw-alias-bg-layer-2/3`、`--dsw-elevation-prominent`。

## 热更新

- `client.js` 由客户端 HMR 接收器热替换。
- `index.js` 需要一次 profile 重组；对 `.dsh/profiles/<name>/cordis.patch.yml` 写入内容可触发。
- 新增/移除包同样需要 profile 重组。
