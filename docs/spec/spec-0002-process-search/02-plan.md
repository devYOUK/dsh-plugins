---
id: spec-0002
updated: 2026-11-13
---

# 方案

## 实现方案

1. 收集阶段把每个流项分类为不可搜索 / 可见 / 折叠可展开（`classifyContainer`）。reasoning 与 tool-call 排除；过程成员在「过程」开启时收集，折叠的命中标记 `hidden: true`。
2. 导航统一走 `activate(start, list, delta)`：可见命中直接测量滚动；隐藏命中先 `revealContainer(container)`。
3. 展开复用宿主机制：过程行隐藏时是 `hidden="until-found"`，宿主监听 `beforematch` 并设为展开。插件对最近的 hidden 祖先派发 `beforematch`，在 600ms 上限内轮询「`hidden` 已移除且 `data-chat-motion` 已清空」，再多等一帧。
4. 展开失败（元素断开、超时）时把命中放进 `deadRef`，从计数扣除并继续找下一个。
5. 重新收集时清空 `deadRef`；计数显示 `当前/可定位总数`。

## 接口与数据

- 命中对象：`{ node, start, end, container, hidden }`。
- 搜索条：`opts.includeProcess` 同时控制“是否搜索过程说明”和“是否搜索折叠过程并自动展开”。
- 不新增 Config 字段。
- DOM 契约：`hidden="until-found"`、`beforematch`、`data-chat-motion`、`data-turn-process-member`。

## 测试与验证

- 范围断言：过程开/关、折叠标记、reasoning/tool-call/隐藏答案排除。
- 揭示断言：`beforematch` 只派发一次、隐藏祖先定向、已可见不派发、超时失败、脱离文档失败。
- 实机：折叠一个含关键词的分组，过程开启时能搜到并展开。
