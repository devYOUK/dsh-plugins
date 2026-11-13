---
id: spec-0002
updated: 2026-11-13
---

# 验收

## 环境

- DSH 桌面版，profile `desktop`，Windows。
- 包：`packages/chat-search` 0.1.0。

## 证据

- 搜索范围断言 14 条通过：过程开/关、折叠标记、reasoning/tool-call/隐藏答案排除。
- 揭示断言 10 条通过：`beforematch` 派发次数、隐藏祖先定向、超时、脱离文档。
- 客户端模块热替换后 `plugins.row.config` 注册仍 active。
- 配置页 schema 只剩三个数字字段（移除 `searchFoldedProcess` 后验证）。

## 结论

通过。折叠分组的真实展开动画未做端到端自动化验证，依赖用户实机使用；失败路径由断言覆盖。2026-11-13 用户明确认可全部 spec 验收通过。
