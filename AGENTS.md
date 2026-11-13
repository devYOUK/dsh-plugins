# AGENTS.md

本仓库是 DSH 本地插件工作区，用 Spec-to-Delivery（S2D）管理需求。动手前先读 [`docs/spec-workflow.md`](docs/spec-workflow.md) 与 [`docs/spec/README.md`](docs/spec/README.md)。

## 工作流

1. 改行为前先分诊 S/M/L（见 `docs/spec-workflow.md`），拿不准往上取。
2. 新需求从 `docs/_templates/spec/` 复制到 `docs/spec/spec-000N-<slug>/`，填 `README.md` 的 front matter 与七件套。
3. 按级别过门禁：S 需人工批 G2/G5；M 加 G3；L 加 G3/G6。Agent 只做 G1/G4 自检与证据，不自批人工门禁。
4. 实现后回写 `04-task.md`、`05-acceptance.md`、`README.md` 的 Gate log 与状态；行为/决策/配置变化同步回 01/02/03/06。
5. 交付前跑 `npm run check` 与 `npm run docs:check`；索引由 `npm run docs:index` 生成。

已有 spec 覆盖的改动，在原 spec 内追加内容，不新开目录。0001–0004 是交付后补录且已 `released`；新需求正常走门禁。

## 硬规则

- 代码与 spec 冲突时以 spec 为准；确需改行为，先改 spec 再改代码。
- 不手工改 `docs/spec/README.md` 的索引块（`<!-- spec-index:start/end -->` 之间）。
- 不把生产 IP / 路径 / 凭据写进 spec 或 reference。
- 每份 reference 必须带 `owner`、`last_verified`、`review_interval_days`、`source`；过期就重新验证或归档。
- 架构取舍写 ADR 到 `docs/decisions/`，编号不复用。

## 本仓库的插件约定

- 每个包在 `packages/<name>/`：`index.js`（Host）、`client.js`（Client）、`cordis.patch.yml`、`locale/`、`icon.svg`。
- 不要 import 宿主 Client 包（如 `@deepseek-ai/dsh-client-ui-primitives`）；复制宿主的标记结构，样式只用主题 token。
- `client.js` 由 HMR 热替换；`index.js` 需要一次 profile 重组才生效。
- 设置项必须声明为 `volatile()`，否则设置服务不服务该条目、也不接受写入。

## 验证

- 结构：`npm run check`（JS 语法）、`npm run docs:check`（S2D 结构、时效、链接）。
- 行为：为纯逻辑写断言脚本；不要用假页面冒充实机验证。
- 没有浏览器控制时，明确报告「实机未验证」，并说明已验到哪一层（模块加载、slot 注册、断言）。
