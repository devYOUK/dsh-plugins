---
id: 0002
updated: 2026-10-28
---

# 0002 · 实现方案

## 方案

没有独立配置：折叠行为直接并入搜索条的「过程」范围（`opts.includeProcess`，默认开）。

搜索与定位：

1. 收集阶段把每个流项分类为不可搜索 / 可见 / 折叠可展开（`classifyContainer`）。reasoning 与 tool-call 永远排除；过程成员在「过程」开启时收集，折叠的行给命中打上 `hidden: true`。
2. 导航统一走 `activate(start, list, delta)`：命中可见就直接测量滚动；`hidden` 命中先 `revealContainer(container)`。
3. 展开复用宿主现成的机制：过程行隐藏时是 `hidden="until-found"`，宿主在元素上监听 `beforematch` 并把过程设为展开。插件对最近的 hidden 祖先派发 `beforematch`，然后在 600ms 上限内轮询“`hidden` 已移除且 `data-chat-motion` 已清空”，再多等一帧让布局稳定。
4. 展开失败（元素断开、超时后仍隐藏）→ 该命中放进 `deadRef`，从计数中扣除并继续按方向找下一个；不会把用户留在看不见的位置。
5. 每次重新收集（改查询、DOM 变化）都清空 `deadRef`，因为宿主可能已经把内容展开。
6. 计数显示 `当前/可定位总数`，避免出现“3/8 但按三次都没反应”。

备选方案：点折叠头部的按钮——放弃，头部与命中行是兄弟节点，需要额外定位且依赖按钮结构；`beforematch` 是宿主为浏览器查找预留的同一入口。

## 接口与数据

- 不新增 Config 字段；`chat-search` 仍是三个数字字段，配置页不出现折叠开关。
- 搜索条 `opts.includeProcess` 同时决定“是否搜索过程说明”和“是否搜索折叠过程并自动展开”。
- 命中对象扩展为 `{ node, start, end, container, hidden }`；`container` 用于 `beforematch` 派发与展开等待。
- DOM 契约：`hidden="until-found"`、`beforematch`、`data-chat-motion`、`data-chat-flow-kind`、`data-chat-group-part`、`data-turn-process-member`、`data-turn-process-answer`。

## 测试与验证

- 结构：`npm run check`、`npm run spec:check`。
- 行为断言（纯逻辑，临时脚本）：
  - 收集口径：过程开 / 关，reasoning / tool-call / 隐藏答案的排除，折叠成员被标记为 `hidden`；
  - 揭示：`beforematch` 只派发一次、隐藏祖先定向、已可见不派发、拒绝展开时按 600ms 超时失败、脱离文档立即失败。
- 实机验证：折叠一个含关键词的过程分组，过程开启时能搜到并自动展开定位；无浏览器控制时报告未验证。
