# chat-search 实现说明

面向维护者；用户文档见根目录 README。行为规格见 [`../specs/0001-chat-search/spec.md`](../specs/0001-chat-search/spec.md) 与 [`../specs/0002-chat-search-process-expand/spec.md`](../specs/0002-chat-search-process-expand/spec.md)。

## 搜索范围与 DOM 契约

助手文本渲染为 `assistant-step` 流项（`data-chat-flow-kind`），按 `data-chat-group-part="response"`（模型写出的内容）和 `"reasoning"`（折叠的思考流）拆分。不存在 `assistant` 这个 kind，所以旧的 `kind === 'assistant'` 判断只能命中折叠态的 compact answer（`data-turn-process-answer`）。

- 始终搜索：用户与 steering 轮次、最终回答、可见的 response 文本、compact answer。
- 永不搜索：`reasoning`、tool-call、`turn-process` 包装节点。
- 过程说明（`data-turn-process-member`）跟随搜索条的「过程」开关。
- 折叠的过程行是 `hidden="until-found"`；「折叠过程正文」配置打开后才会被收集，命中时派发 `beforematch` 展开，等 `hidden`/`data-chat-motion` 清空后再测量滚动（600ms 上限）。展开失败的行从计数中剔除。

收集逻辑集中在 `classifyContainer()`，返回 `null` / `{ hidden: false }` / `{ hidden: true }`；导航统一走 `activate()`。修改搜索范围只需要动这两处。

## 配置与设置服务

Host 的 `Config` 命名空间就是插件行 id `chat-search`，客户端通过 `ctx.configForms.get('chat-search')` 读写。所有字段必须是 `.volatile()`：设置服务只服务带 volatile 字段的条目，也只有 volatile 路径接受写入；普通字段会让整页没有可编辑项。

| 键 | 类型 | 默认 | 作用 |
|---|---|---|---|
| `transparencyPercent` | number 0–100 | 38 | 搜索条背景透明度 |
| `blurPx` | number 0–120 | 60 | `backdrop-filter: blur()` 半径 |
| `highlightPercent` | number 0–100 | 38 | 命中高亮 alpha |
| `searchFoldedProcess` | boolean | false | 折叠过程正文参与搜索并自动展开 |

配置写入落在 profile 的 `cordis.patch.yml`，形如：

```yaml
- id: chat-search
  name: "@local/dsh-chat-search"
  config:
    transparencyPercent: 60
    blurPx: 6
```

## 配置页

注册在 `plugins.row.config`，键为 `@local/dsh-chat-search#chat-search`。表单是**暂存**模型：编辑只改本地草稿，保存时用首次编辑读到的 revision 做一次 `mutate`，被拒保留草稿并提示。`已覆盖` / `恢复默认` 依据 `snapshot.user` 是否包含该键。

字段的标记结构与 CSS 抄自宿主 `ui-primitives` 的 settings-form（`role="switch"`、`aria-checked`、输入框与提示的尺寸），但**不要**从插件里 import 那个包；样式只用主题 token。

## 搜索条与高亮

- 入口在 `conversation.session.header.utilities`，快捷键 `Ctrl+F`；`Esc` 先关历史下拉再关搜索条。
- 高亮层是 `position: fixed` 的矩形集合，不参与宿主布局；滚动时按 `requestAnimationFrame` 重测。
- 查询历史存在 `localStorage` 的 `dsh-chat-search:history`，最多 20 条。
- 单次搜索最多 400 条命中；超长会话的常见词会被截断。
