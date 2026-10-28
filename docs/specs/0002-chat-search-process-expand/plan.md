---
id: 0002
updated: 2026-10-28
---

# 0002 · 实现方案

## 方案

配置与表单：

- Host `Config` 增加 `searchFoldedProcess: Schema.boolean().default(false).volatile()`；仍是 `chat-search` 命名空间，设置服务只服务 volatile 字段。
- 客户端 `SettingsModel` 原先把每个字段包成 `numberSpec`；现在按 `kind` 分派到 `numberSpec` 或 `booleanSpec`（`format` 输出 `'true'`/`'false'`，`parse` 只接受这两个值）。配置页用 `role="switch"` + `aria-checked` 渲染，点击直接改草稿，保存仍是一次 `mutate`。
- 「恢复默认」对布尔字段同样发 `unset`。

搜索与定位：

1. 收集阶段把每个流项分类为不可搜索 / 可见 / 折叠可展开（`classifyContainer`）。reasoning 与 tool-call 永远排除；折叠的过程正文只有在「过程」范围开启**且**配置开启时才收集，并给命中打上 `hidden: true`。
2. 导航统一走 `activate(start, list, delta)`：命中可见就直接测量滚动；`hidden` 命中先 `revealContainer(container)`。
3. 展开复用宿主现成的机制：过程行隐藏时是 `hidden="until-found"`，宿主在元素上监听 `beforematch` 并把过程设为展开。插件对最近的 hidden 祖先派发 `beforematch`，然后在 600ms 上限内轮询“`hidden` 已移除且 `data-chat-motion` 已清空”，再多等一帧让布局稳定。
4. 展开失败（元素断开、超时后仍隐藏）→ 该命中放进 `deadRef`，从计数中扣除并继续按方向找下一个；不会把用户留在看不见的位置。
5. 每次重新收集（改查询、DOM 变化）都清空 `deadRef`，因为宿主可能已经把内容展开。
6. 计数显示 `当前/可定位总数`，避免出现“3/8 但按三次都没反应”。

备选方案：点折叠头部的按钮——放弃，头部与命中行是兄弟节点，需要额外定位且依赖按钮结构；`beforematch` 是宿主为浏览器查找预留的同一入口。

## 接口与数据

- Config `chat-search`：新增 `searchFoldedProcess`（boolean，默认 false，volatile）。
- 表单模型：字段描述从单一 `numberSpec` 泛化为 `kind: 'number' | 'boolean'`；`field()` 返回值仍是 `{ text, overridden, invalid }`。
- 搜索条 `opts.includeProcess` 仍是范围开关；配置只决定折叠部分是否纳入，不改变可见部分的语义。
- 命中对象扩展为 `{ node, start, end, container, hidden }`；`container` 用于 `beforematch` 派发与展开等待。
- DOM 契约：`hidden="until-found"`、`beforematch`、`data-chat-motion`、`data-chat-flow-kind`、`data-chat-group-part`、`data-turn-process-member`、`data-turn-process-answer`。

## 测试与验证

- 结构：`npm run check`、`npm run spec:check`。
- 行为断言（纯逻辑，临时脚本）：
  - `booleanSpec` 的 format/parse；
  - 表单模型在布尔字段上的暂存、保存、恢复默认；
  - 收集口径：过程范围关 / 开 × 折叠配置关 / 开 的组合，reasoning / tool-call / 隐藏答案的排除；
  - 折叠过程正文被标记为 `hidden` 供展开。
- 实机验证：折叠一个含关键词的过程分组，配置关闭时搜不到、开启时能搜到并自动展开定位；无浏览器控制时报告未验证。
