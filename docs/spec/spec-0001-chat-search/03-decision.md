---
id: spec-0001
updated: 2026-11-13
---

# 决策

| # | 决策 | 备选 | 结论 | 理由 |
|---|---|---|---|---|
| D1 | 搜索范围按 `data-chat-flow-kind="assistant-step"` 判断 | 沿用 `kind === 'assistant'` | 采用 assistant-step，并排除 reasoning/tool-call | 宿主没有 `assistant` kind；旧判断只能命中折叠态的 compact answer |
| D2 | 高亮层用 fixed 矩形覆盖正文 | 往正文里插 `<mark>` | 采用 fixed 层 | 不触发宿主布局与 React 重渲染，滚动时只重测矩形 |
| D3 | 配置页暂存后保存 | 拖动即写 | 采用暂存 + 保存 | 与宿主设置表单契约一致，避免每帧写配置 |
