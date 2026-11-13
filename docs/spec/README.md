# 规格索引与规则

本目录每份需求是一个 `spec-NNNN-<slug>/` 目录，七件套齐全；方法见 [`../spec-workflow.md`](../spec-workflow.md)。

## 规则

- 目录名：`spec-<4 位数字>-<kebab-slug>`，编号从 0001 起，不复用。
- `README.md` front matter 必填：`id`（`spec-000N`）、`slug`、`title`、`size`（S/M/L）、`size_reason`、`status`、`release`、`owner`。
- 状态：`draft → G1 → G2 → G3 → G4 → G5 → G6 → released`；S 级 G3/G6 写 N/A。
- 人工门禁：S 是 G2/G5；M 是 G2/G3/G5；L 是 G2/G3/G5/G6。Agent 不自批。
- 每个 Gate 在 `README.md` 的 Gate log 记录日期、结论、审批与证据。
- 新 spec 从 [`../_templates/spec/`](../_templates/spec/README.md) 复制，不要手抄旧目录。
- 下方索引由 `npm run docs:index` 从各 spec front matter 生成，不要手改索引块。

## 索引

<!-- spec-index:start -->
## 状态看板

共 4 个需求。

| 状态 | 含义 | 数量 |
| --- | --- | --- |
| released | 已发布 | 4 |

## 需求列表

| 编号 | 需求 | 级别 | 状态 | 版本 |
| --- | --- | --- | --- | --- |
| [spec-0001](spec-0001-chat-search/README.md) | 对话内搜索 | S | released | 0.1.0 |
| [spec-0002](spec-0002-process-search/README.md) | 折叠过程正文的搜索与自动展开 | S | released | 0.1.0 |
| [spec-0003](spec-0003-git-branch-pill/README.md) | Git 分支速览 | S | released | 0.1.0 |
| [spec-0004](spec-0004-workspace-menu/README.md) | 工作区右键菜单 | S | released | 0.1.0 |
<!-- spec-index:end -->
