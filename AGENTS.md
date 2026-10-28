# AGENTS.md

本仓库是 DSH 本地插件工作区，采用规格驱动开发（SDD）。动手前先读 [`docs/README.md`](docs/README.md)。

## 工作流

1. 判断改动是否改变用户可见行为。是 → 先写规格；否 → 见下方「例外」。
2. 新建规格：`npm run spec:new -- <slug> "<标题>"`，填 `spec.md` 的背景、目标、非目标、行为与验收、影响面，把 `status` 改为 `approved` 再动代码。
3. 实现时把方案与契约写进 `plan.md`，工作项写进 `tasks.md` 并逐条勾选。
4. 行为验收通过、任务全部勾完后，`status` 改为 `done`，更新 `updated`。
5. 交付前跑：`npm run check` 和 `npm run spec:check`。

## 硬规则

- 代码与规格冲突时以规格为准。确需改变行为，先改 `spec.md`（并更新 `updated`），再改代码。
- 已有规格覆盖的改动，在原目录追加任务，不新建目录。
- 例外（可以不新建规格）：错别字、依赖升级、不改变行为的样式微调。即便如此也要在原 `tasks.md` 追加一条并勾选。
- `docs/BOARD.md` 与 `docs/specs/README.md` 都是生成物，只通过 `npm run spec:index` 更新，不要手改。
- 回滚方式写进规格的「影响面与风险」，不要只留在对话里。

## 本仓库的插件约定

- 每个包在 `packages/<name>/`：`index.js`（Host，声明 `Config` 与 `apply`）、`client.js`（Client，`window.__ModuleLoader__.load`）、`cordis.patch.yml`、`locale/`、`icon.svg`。
- 不要 import 宿主 Client 包（如 `@deepseek-ai/dsh-client-ui-primitives`）；复制宿主的标记结构，样式只用主题 token。
- `client.js` 由 HMR 热替换；`index.js` 需要一次 profile 重组才生效。
- 设置项必须声明为 `volatile()`，否则设置服务不服务该条目、也不接受写入。

## 验证

- 结构：`npm run check`（JS 语法）、`npm run spec:check`（规格结构与索引）。
- 行为：为纯逻辑写断言脚本，放在 `scripts/` 或临时目录；不要用假页面冒充实机验证。
- 没有浏览器控制时，明确报告「实机未验证」，并说明已验到哪一层（模块加载、slot 注册、断言）。
