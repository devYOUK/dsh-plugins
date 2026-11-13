---
id: spec-0002
updated: 2026-11-13
---

# 决策

| # | 决策 | 备选 | 结论 | 理由 |
|---|---|---|---|---|
| D1 | 用 `beforematch` 触发展开 | 点击折叠头 / 改宿主 state | 采用 `beforematch` | 宿主为浏览器查找预留的揭示入口，不依赖头部 DOM |
| D2 | 折叠行为并入「过程」开关 | 独立配置 `searchFoldedProcess` | 不保留独立配置 | 用户要搜过程时不该再去配置页开第二个开关；减少状态组合 |
| D3 | 展开等待 600ms 上限 | `transitionend` / 200ms | 轮询 `hidden` + `data-chat-motion`，600ms 上限 | 覆盖折叠动画，失败可预期 |
