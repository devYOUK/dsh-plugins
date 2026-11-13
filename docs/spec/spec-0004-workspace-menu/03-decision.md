---
id: spec-0004
updated: 2026-11-13
---

# 决策

| # | 决策 | 备选 | 结论 | 理由 |
|---|---|---|---|---|
| D1 | 用 `data-row-key` 做右键命中 | 替换 `sidebar.workspaces` 重画浏览器 | 采用 DOM 钩子 + `shell.overlay` | 宿主没有工作区行菜单 slot；替换整块成本与风险过高 |
| D2 | 收藏存浏览器 `localStorage` | 写 Host 插件配置 | 先采用 localStorage | 无 Host 变更、实现简单；代价是按浏览器来源隔离 |
| D3 | 用注入 CSS 给标题染色加粗 | 直接改行内样式 | 采用属性 + CSS 选择器 | 属性可随收藏状态增删，样式由主题 token 驱动 |
