---
id: 0001
updated: 2026-10-28
---

# 0001 · 实现方案

## 方案

一个 bundle、两个半侧：

- Host（`index.js`）只声明 `Config`，作为设置的命名空间载体；字段全部 `volatile()`，设置服务才会服务它并接受写入。
- Client（`client.js`）在 `conversation.session.header.utilities` 放入口按钮，用 `document.createRange` + 文本节点游标扫描正文，高亮层是 `position: fixed` 的绝对定位矩形，不参与宿主布局。
- 配置页注册在 `plugins.row.config`，键为 `@local/dsh-chat-search#chat-search`。表单是**暂存**模型：编辑只改本地草稿，保存时用首次编辑读到的 revision 做一次 `mutate`，被拒保留草稿。
- 搜索范围按宿主流项的真实 kind 判断（`assistant-step` 而非 `assistant`），`assistant-step` 的 `reasoning` 分部与 `tool-call` 永远排除。

备选方案：用 `position: sticky` 的搜索条代替 fixed 浮层——放弃，因为会改变正文回流。

## 接口与数据

- Config 命名空间 `chat-search`：`transparencyPercent`(0–100)、`blurPx`(0–120)、`highlightPercent`(0–100)。
- `ctx.configForms.get('chat-search')` 的共享表单：`getSnapshot()` 返回 `{ status, value, base, user, revision, writable }`；写用 `mutate(ops, revision)`，`ops` 形如 `{ op: 'set', path: [key], value }` 或 `{ op: 'unset', path: [key] }`。
- CSS 变量：`--cs-tint`（底色不透明度）、`--cs-blur`、`--cs-hit`、`--cs-hit-current`，由保存后的表单快照驱动。
- localStorage：`dsh-chat-search:history`，最多 20 条。
- DOM 契约见 `spec.md` 的「影响面与风险」；判断逻辑集中在 `isSearchable()`，改动只需动这一处。

## 测试与验证

- 结构：`npm run check`、`npm run spec:check`。
- 行为断言：临时脚本覆盖表单模型（暂存/保存/重置/冲突/只读/非法输入）与搜索范围谓词（user、回答、过程说明、reasoning、tool-call、折叠隐藏）。
- 实机验证：`Ctrl+F` 搜索、配置页保存后外观变化、折叠/展开过程后结果更新；无浏览器控制时只能验证到模块热更新与 slot 注册。
