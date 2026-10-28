---
id: 0002
updated: 2026-10-28
---

# 0002 · 任务

## 任务

- [x] Host `Config` 增加 `searchFoldedProcess` 布尔字段（volatile）并加说明
- [x] 客户端表单模型支持布尔字段与 `role="switch"` 控件
- [x] 配置页渲染布尔字段，保存/恢复默认/只读与数字字段一致
- [x] 收集阶段区分可见命中与折叠可展开命中，不可展开的丢弃
- [x] 定位命中时自动展开所属分组（`beforematch`，幂等）
- [x] 等待展开（`hidden` 移除 + `data-chat-motion` 清空，600ms 上限）后重新测量并滚动
- [x] 展开失败时从结果剔除并跳到下一个可定位命中
- [x] 搜索条「过程」范围与配置的叠加语义（配置关 → 维持 0001）
- [x] 断言脚本覆盖 booleanSpec、表单模型、四种范围组合
- [x] `npm run check` 与 `npm run spec:check` 通过
