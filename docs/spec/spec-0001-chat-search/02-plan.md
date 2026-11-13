---
id: spec-0001
updated: 2026-11-13
---

# 方案

## 实现方案

一个 bundle、两个半侧：

- Host（`index.js`）只声明 `Config`，作为设置命名空间载体；字段全部 `volatile()`，设置服务才服务它并接受写入。
- Client（`client.js`）在会话头部放入口按钮，用 `document.createRange` + 文本节点游标扫描正文；高亮层是 `position: fixed` 的矩形集合，不参与宿主布局。
- 配置页注册在 `plugins.row.config`，键为 `@local/dsh-chat-search#chat-search`；表单是暂存模型，保存时用首次编辑读到的 revision 做一次 `mutate`。
- 搜索范围按宿主流项的真实 kind 判断（`assistant-step`，不是 `assistant`），`reasoning` 与 tool-call 永远排除。

备选方案：用 sticky 搜索条代替 fixed 浮层——放弃，会让正文回流。

## 接口与数据

- Config `chat-search`：`transparencyPercent`（0–100）、`blurPx`（0–120）、`highlightPercent`（0–100）。
- 共享表单：`ctx.configForms.get('chat-search')`，`getSnapshot()` 返回 `{ status, value, base, user, revision, writable }`；写用 `mutate(ops, revision)`。
- CSS 变量：`--cs-tint`、`--cs-blur`、`--cs-hit`。
- localStorage：`dsh-chat-search:history`，最多 20 条。

## 测试与验证

- 结构：`npm run check`、S2D `docs:check`。
- 行为断言：表单模型（暂存/保存/重置/冲突/只读/非法输入）与搜索范围谓词。
- 实机验证：`Ctrl+F`、配置保存后的外观变化；无浏览器控制时只验证模块加载与 slot 注册。
